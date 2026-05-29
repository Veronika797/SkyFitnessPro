import { useState } from "react";

export const useModalManagement = () => {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const openWorkoutModal = () => setIsWorkoutModalOpen(true);
  const closeWorkoutModal = () => setIsWorkoutModalOpen(false);

  const openProgressModal = () => setIsProgressModalOpen(true);
  const closeProgressModal = () => setIsProgressModalOpen(false);

  return {
    isWorkoutModalOpen,
    openWorkoutModal,
    closeWorkoutModal,

    isProgressModalOpen,
    openProgressModal,
    closeProgressModal,
  };
};
