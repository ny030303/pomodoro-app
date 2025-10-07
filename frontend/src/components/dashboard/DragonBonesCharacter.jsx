import React, { useRef, useEffect } from 'react';
import * as PixiReact from '@pixi/react';
import { useDragonBones } from '../../hooks/useDragonBones';

const DragonBonesCharacter = (props = {}) => {
  const { armature, isLoading } = useDragonBones(props.armatureName || 'Armature') || {};
  const containerRef = useRef(null);

  useEffect(() => {
    if (armature && containerRef.current && !armature.parent) {
      armature.animation.play('idle', 0);
      containerRef.current.addChild(armature);
    }
    return () => {
      if (armature && armature.parent) {
        armature.parent.removeChild(armature);
        armature.destroy();
      }
    };
  }, [armature]);

  if (isLoading) return null;

  return <PixiReact.Container ref={containerRef} {...props} />;
};

export default DragonBonesCharacter;
