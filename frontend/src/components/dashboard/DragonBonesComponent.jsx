import { useEffect, useRef } from "react";
import { useApplication } from "@pixi/react";
import { PixiFactory } from "dragonbones-pixijs";

const DragonBonesComponent = () => {
  const app = useApplication().app;
  const armatureDisplayRef = useRef(null);

  useEffect(() => {
    if (!app) return;

    const factory = PixiFactory.factory;

    // 중복 파싱 방지용 플래그 (local 변수 or ref로 관리)
    let dataParsed = false;

    if (!dataParsed) {
      dataParsed = true;
      const characterUrl = "/assets/Ubbie_1_";
      Promise.all([
        fetch(characterUrl + "ske.json").then(res => res.json()),
        fetch(characterUrl + "tex.json").then(res => res.json()),
        new Promise(resolve => {
          const img = new Image();
          img.src = characterUrl + "tex.png";
          img.onload = () => resolve(img);
        }),
      ]).then(([skeJson, texJson, texImg]) => {
        console.log('skeleton armature:', skeJson.armature);          // 실제 name, slot, display 구조
        console.log('atlas subTextures:', texJson.SubTexture);        // PNG 내부 서브 파츠 목록
        console.log('PNG loaded:', texImg.src, texImg.width, texImg.height); // PNG 정상 로드 검사
        const armatureName = skeJson.armature[0]?.name; // 실제 이름은 'Armature'
        const textureAtlasName = texJson.name;
        factory.parseDragonBonesData(skeJson);
        factory.parseTextureAtlasData(texJson, texImg);

        const armatureDisplay = factory.buildArmatureDisplay(armatureName, textureAtlasName);
        if (!armatureDisplay) {
          console.error(`No armature display found for ${armatureName}`);
          return;
        }

        // armatureDisplay.debugDraw = false; // 디버그 모드 해제

        console.log(armatureDisplay);
        console.log(app);
        // 중앙 배치 : renderer가 아닌 screen으로
        const width = app.width ?? 800;
        const height = app.height ?? 600;

        armatureDisplay.x = width / 2;
        armatureDisplay.y = height / 2;
        
        armatureDisplay.animation.play("walk");
        app.stage.addChild(armatureDisplay);
        armatureDisplayRef.current = armatureDisplay;
      });

    }

    return () => {
      if (armatureDisplayRef.current) {
        app.stage.removeChild(armatureDisplayRef.current);
        armatureDisplayRef.current.destroy();
        armatureDisplayRef.current = null;
        dataParsed = false;
      }
    };
  }, [app]);

  return null;
};

export default DragonBonesComponent;
