import { useEffect, useRef } from "react";
import { useApplication } from "@pixi/react";
import * as PIXI from "pixi.js";
import { PixiFactory } from "dragonbones-pixijs";

const PARTS = [
  "body", "ear_left", "ear_right", "eye_left", "eye_right", "head", "nose", "tail"
];

const AssetDir = "assets/NewProject_1_texture/Gemini_Generated_Image_6153bl6153bl6153/";
const characterUrl = "/assets/NewProject_1_";
const baseWidth = 900;
const baseHeight = 200;

const DragonBonesComponent = () => {
  const app = useApplication().app;
  const armatureDisplayRef = useRef(null);
  const partTexturesRef = useRef({});

  useEffect(() => {
  if (!app) return;
  let destroyed = false;
  const factory = PixiFactory.factory;

  // 모든 개별 PNG 파츠 미리 Asset Loader로 로딩
  (async () => {
    
    const toLoad = PARTS.map(name => AssetDir + `${name}.png`);
    await PIXI.Assets.load(toLoad);

    Promise.all([
      fetch(characterUrl + "ske.json").then(res => res.json()),
      fetch(characterUrl + "tex.json").then(res => res.json()),
      new Promise(resolve => {
        const img = new window.Image();
        img.src = characterUrl + "tex.png";
        img.onload = () => resolve(img);
      }),
    ]).then(([skeJson, texJson, texImg]) => {
      factory.parseDragonBonesData(skeJson);
      factory.parseTextureAtlasData(texJson, texImg);
      const armatureName = skeJson.armature[0]?.name;
      const textureAtlasName = texJson.name;
      const armatureDisplay = factory.buildArmatureDisplay(armatureName, textureAtlasName);
      if (!armatureDisplay) return;
      PARTS.forEach(slotName => {
        const slot = armatureDisplay.armature.getSlot(slotName);
        if (slot) {
          const sprite = new PIXI.Sprite(PIXI.Texture.from(AssetDir + `${slotName}.png`));
          sprite.anchor.set(0.5);
          slot.setDisplay(sprite, true);
        }
      });
      armatureDisplay.x = (app.screen?.width ?? baseWidth) / 2;
      armatureDisplay.y = (app.screen?.height ?? baseHeight) / 2;
      const scale = getScale(app.screen.width, app.screen.height);
      console.log(scale);
      armatureDisplay.scale.set(scale);
      armatureDisplay.animation.play("idle");
      app.stage.addChild(armatureDisplay);
      armatureDisplayRef.current = armatureDisplay;
    });
  })();

  return () => {
    if (armatureDisplayRef.current) {
      app.stage.removeChild(armatureDisplayRef.current);
      armatureDisplayRef.current.destroy();
      armatureDisplayRef.current = null;
    }
  };
}, [app]);

  return null;
};
function getScale(appWidth, appHeight) {
  const scaleX = appWidth / baseWidth;
  const scaleY = appHeight / baseHeight;
  return Math.min(scaleX, scaleY);
}
export default DragonBonesComponent;
