import * as THREE from "three";
import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useGame = /* @__PURE__ */ create(
  /* @__PURE__ */ subscribeWithSelector((set, get) => {
  
    return {
      // Point to move point
      moveToPoint: null,

      // Check is camera based movement
      isCameraBased: false,

      // Character animations state management
      // Initial animation
      curAnimation: null,
      animationSet: {},

      initializeAnimationSet: function(animationSet) {
        set((state) => {
          if (Object.keys(state.animationSet).length === 0) {
            return { animationSet };
          }
          return {};
        });
      },

      reset: function() {
        set((state) => {
          return { curAnimation: state.animationSet.idle };
        });
      },

      idle: function() {
        set((state) => {
          if (state.curAnimation === state.animationSet.jumpIdle) {
            return { curAnimation: state.animationSet.jumpLand };
          } else if (
            state.curAnimation !== state.animationSet.action1 &&
            state.curAnimation !== state.animationSet.action2 &&
            state.curAnimation !== state.animationSet.action3 &&
            state.curAnimation !== state.animationSet.action4
          ) {
            return { curAnimation: state.animationSet.idle };
          }
          return {};
        });
      },

      walk: function() {
        set((state) => {
			console.log("walk function called");
			console.log("Current animation:", state.curAnimation);
			console.log("Intended walk animation:", state.animationSet.walk);
			console.log("Action4 animation:", state.animationSet.action4);
		
          if (state.curAnimation !== state.animationSet.action4) {
			console.log("Condition met: Changing curAnimation to walk");

            return { curAnimation: state.animationSet.walk };
          }
          return {};
        });
      },

      run: function() {
        set((state) => {
          if (state.curAnimation !== state.animationSet.action4) {
            return { curAnimation: state.animationSet.run };
          }
          return {};
        });
      },

      jump: function() {
        set((state) => {
          return { curAnimation: state.animationSet.jump };
        });
      },

      jumpIdle: function() {
        set((state) => {
          if (state.curAnimation === state.animationSet.jump) {
            return { curAnimation: state.animationSet.jumpIdle };
          }
          return {};
        });
      },

      jumpLand: function() {
        set((state) => {
          if (state.curAnimation === state.animationSet.jumpIdle) {
            return { curAnimation: state.animationSet.jumpLand };
          }
          return {};
        });
      },

      fall: function() {
        set((state) => {
          return { curAnimation: state.animationSet.fall };
        });
      },

      action1: function() {
        set((state) => {
          if (state.curAnimation === state.animationSet.idle) {
            return { curAnimation: state.animationSet.action1 };
          }
          return {};
        });
      },

      action2: function() {
        set((state) => {
          if (state.curAnimation === state.animationSet.idle) {
            return { curAnimation: state.animationSet.action2 };
          }
          return {};
        });
      },

      action3: function() {
        set((state) => {
          if (state.curAnimation === state.animationSet.idle) {
            return { curAnimation: state.animationSet.action3 };
          }
          return {};
        });
      },

      action4: function() {
        set((state) => {
          if (
            state.curAnimation === state.animationSet.idle ||
            state.curAnimation === state.animationSet.walk ||
            state.curAnimation === state.animationSet.run
          ) {
            return { curAnimation: state.animationSet.action4 };
          }
          return {};
        });
      },

      // Set/get point to move point
      setMoveToPoint: function(point) {
        set(() => {
          return { moveToPoint: point };
        });
      },

      getMoveToPoint: function() {
        return {
          moveToPoint: get().moveToPoint,
        };
      },

      // Set/get camera based movement
      setCameraBased: function(isCameraBased) {
        set(() => {
          return { isCameraBased: isCameraBased };
        });
      },

      getCameraBased: function() {
        return {
          isCameraBased: get().isCameraBased,
        };
      },
    };
  })
);

