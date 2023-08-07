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
      let element = e.target;
      // if the element is an input, dont move
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') return;
      if (e.key === 'w' || e.key === 'W' && ! movement.current.forward) movement.current.forward = true;
      else if (e.key === 's' || e.key === 'S' && ! movement.current.backward) movement.current.backward = true;
      else if (e.key === 'a' || e.key === 'A' && ! movement.current.left) movement.current.left = true;
      else if (e.key === 'd' || e.key === 'D' && ! movement.current.right) movement.current.right = true;
      else if (e.key === 'space') movement.current.space = true;
      else if (e.key === 'Shift') movement.current.shift = true;
      else if (e.key === 'r' || e.key === 'R'){
        if (e.metaKey || e.ctrlKey){
          movement.current.respawn = false;
        } else {
          movement.current.respawn = true;
        }

      }
      
    }

    const handleKeyUp = (e) => {
      if (e.key === 'w' || e.key === 'W') movement.current.forward = false;
      else if (e.key === 's' || e.key === 'S') movement.current.backward = false;
      else if (e.key === 'a' || e.key === 'A') movement.current.left = false;
      else if (e.key === 'd' || e.key === 'D') movement.current.right = false;
      else if (e.key === 'space') movement.current.space = false;
      else if (e.key === 'Shift') movement.current.shift = false;
      else if (e.key === 'r' || e.key === 'R') movement.current.respawn = false;
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
