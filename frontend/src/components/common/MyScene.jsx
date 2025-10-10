import { Application, extend, } from '@pixi/react';
import { Container, Graphics, Sprite } from 'pixi.js';
import DragonBonesComponent from '../dashboard/DragonBonesComponent';
extend({ Container, Graphics, Sprite });
extend({ Container, Graphics }); // Pixi 컴포넌트 등록

const MyScene = () => (
    // <Application width={400} height={600} options={{ backgroundAlpha: 0 }}>
    <Application width={260} height={260} backgroundAlpha={0}>
        <DragonBonesComponent scale={1} />
    </Application>
);

export default MyScene;
