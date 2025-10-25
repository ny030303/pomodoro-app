import { Application, extend, } from '@pixi/react';
import { Container, Graphics, Sprite } from 'pixi.js';
import DragonBonesComponent from '../dashboard/DragonBonesComponent';
extend({ Container, Graphics, Sprite });
extend({ Container, Graphics }); // Pixi 컴포넌트 등록

const MyScene = () => {
  {
    // 사용자가 소유한 NFT 메타데이터나 상태에 따라 다른 에셋을 로드할 수 있습니다.


    return (
      // <Application width={400} height={600} options={{ backgroundAlpha: 0 }}>
      <Application width={260} height={260} backgroundAlpha={0}>
        <DragonBonesComponent
          assetDir="/assets/Rabbit/Rabbit_texture/Gemini_Generated_Image_v0ukfxv0ukfxv0uk/"
          characterUrl="/assets/Rabbit/Rabbit_"
          onError={(error) => {
            console.log(`캐릭터 로딩 실패: ${error.message}`);
          }} />
      </Application>
    )
  }
};

export default MyScene;
