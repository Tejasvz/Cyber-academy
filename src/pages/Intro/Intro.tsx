import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectVeilEntryPoint } from '../../components/Landing/ProjectVeilEntryPoint';
import { useAuth } from '../../context/AuthContext';

const Intro: React.FC = () => {
  const navigate = useNavigate();
  const { completeIntro } = useAuth();

  const enterCommandDeck = () => {
    completeIntro();
    navigate('/dashboard', { replace: true });
  };

  return <ProjectVeilEntryPoint onEnter={enterCommandDeck} />;
};

export default Intro;
