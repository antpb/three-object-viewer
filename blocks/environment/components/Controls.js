import { useEffect, useRef } from 'react';

export function useKeyboardControls() {
  const movement = useRef({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false,
    shift: false,
    space: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'w') movement.current.forward = true;
      else if (e.key === 's') movement.current.backward = true;
      else if (e.key === 'a') movement.current.left = true;
      else if (e.key === 'd') movement.current.right = true;
      else if (e.key === 'space') movement.current.space = true;
      // add shift key
      else if (e.key === 'Shift') movement.current.shift = true;
    }

    const handleKeyUp = (e) => {
      if (e.key === 'w') movement.current.forward = false;
      else if (e.key === 's') movement.current.backward = false;
      else if (e.key === 'a') movement.current.left = false;
      else if (e.key === 'd') movement.current.right = false;
      else if (e.key === 'space') movement.current.space = false;
      else if (e.key === 'Shift') movement.current.shift = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, []);

  return movement;
}
