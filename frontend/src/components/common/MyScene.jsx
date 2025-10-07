import { Application, extend } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import DragonBonesCharacter from '../../components/dashboard/DragonBonesCharacter';

extend({ Container, Graphics }); // Pixi 컴포넌트 등록

const MyScene = () => (
  <Application width={400} height={600} options={{ backgroundAlpha: 0 }}>
    <container>
      <DragonBonesCharacter x={200} y={500} scale={0.3} />
    </container>
  </Application>
);

export default MyScene;
