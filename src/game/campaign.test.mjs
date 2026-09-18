import test from 'node:test';
import assert from 'node:assert/strict';
import { gameMissions } from './gameData.ts';
import { executeRangeCommand, initialRangeState } from './terminalEngine.ts';
import { newCampaign, parseCampaign, completeMission, isUnlocked, credits, purchase, campaignXP } from './campaign.ts';

test('all eight missions play from first briefing through the final flag', () => {
  let campaign = newCampaign();
  for (const mission of gameMissions) {
    assert.equal(isUnlocked(campaign, mission.id), true);
    let range = initialRangeState();
    const premature = executeRangeCommand(mission, `submit ${mission.flag}`, range);
    assert.notEqual(premature.tone, 'success');
    for (const objective of mission.objectives) {
      const next = executeRangeCommand(mission, objective.command, range);
      assert.equal(next.state.completedSteps, range.completedSteps + 1, `${mission.id}: ${objective.command}`);
      range = next.state;
      campaign = parseCampaign(JSON.stringify({ ...campaign, ranges: { ...campaign.ranges, [mission.id]: range } }));
      assert.deepEqual(campaign.ranges[mission.id], range, 'checkpoint survives reload');
    }
    assert.equal(executeRangeCommand(mission, `submit ${mission.flag}`, range).tone, 'success');
    campaign = completeMission(campaign, mission.id);
    const before = campaignXP(campaign);
    campaign = completeMission(campaign, mission.id);
    assert.equal(campaignXP(campaign), before, 'replay cannot farm rewards');
  }
  assert.equal(campaign.completed.length, 16);
  assert.equal(campaignXP(campaign), 9150);
  assert.equal(credits(campaign), 1830);
  for (const ending of ['preserve', 'release']) assert.equal(parseCampaign(JSON.stringify({ ...campaign, ending })).ending, ending);
});

test('ordering, exact commands, hints and reinspection are consistent', () => {
  const campaign = newCampaign(), mission = gameMissions[1];
  assert.equal(isUnlocked(campaign, 'B08'), false);
  assert.equal(completeMission(campaign, 'B08'), campaign);
  const initial = initialRangeState();
  assert.equal(executeRangeCommand(mission, 'ls nonsense', initial).state.completedSteps, 0);
  const result = executeRangeCommand(mission, 'ls', initial);
  assert.equal(executeRangeCommand(mission, 'ls', result.state).tone, 'normal');
  const first = gameMissions[0];
  let state = initialRangeState();
  for (const step of first.objectives) state = executeRangeCommand(first, step.command, state).state;
  assert.match(executeRangeCommand(first, 'hint', state).output[0], /submit flag/);
});
test('purchases are bounded, persistent, and cannot produce negative balances', () => {
  let c = newCampaign();
  assert.equal(purchase(c, 'damping'), c);
  c = { ...c, completed: gameMissions.map(m => m.id) };
  for (const id of ['damping', 'recovery', 'analysis', 'archive']) c = purchase(c, id);
  assert.equal(credits(c), 1380);

  const duplicate = purchase(c, 'damping');
  assert.deepEqual(duplicate, c);
  assert.deepEqual(parseCampaign(JSON.stringify(c)).augments, c.augments);
});
test('malformed and stale saves are repaired without breaking entry', () => {
  assert.deepEqual(parseCampaign('{bad'), newCampaign());
  assert.deepEqual(parseCampaign('null'), newCampaign());
  const c = parseCampaign(JSON.stringify({ completed: ['B08'], active: 'B08', augments: ['damping'], ending: 'release' }));
  assert.deepEqual(c.completed, []); assert.equal(c.active, 'B01'); assert.deepEqual(c.augments, []); assert.equal(c.ending, null);
});
