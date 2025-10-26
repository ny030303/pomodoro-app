import { useEffect, useRef } from "react";
import { useApplication } from "@pixi/react";
import * as PIXI from "pixi.js";
import { PixiFactory } from "dragonbones-pixijs";

const PARTS = [
  "head", "body", "ear_left", "ear_right", "tail"
];

const DragonBonesComponent = ({
  assetDir = "assets/Cat/Cat_texture/Gemini_Generated_Image_6153bl6153bl6153/",
  characterUrl = "assets/Cat/Cat_",
  baseWidth = 900,
  baseHeight = 200,
  parts = PARTS,
  initialAnimation = "idle",
  position = null,
  scale = null,
  loop = true,
  onLoaded = null,
  onError = null,
  characterId = null,
}) => {
  const app = useApplication().app;
  const armatureDisplayRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!app) return;
    let destroyed = false;
    const factory = PixiFactory.factory;

    (async () => {
      try {
        // 각 캐릭터를 위한 독립적인 컨테이너
        const container = new PIXI.Container();
        containerRef.current = container;
        app.stage.addChild(container);

        // 1. 스켈레톤 JSON 파일 로드
        const skeletonPath = characterUrl + "ske.json";
        // console.log(`🔍 [${characterId || 'Character'}] Loading skeleton from:`, skeletonPath);
        
        const skeResponse = await fetch(skeletonPath);
        
        if (!skeResponse.ok) {
          throw new Error(`Skeleton file not found (${skeResponse.status}): ${skeletonPath}`);
        }
        
        const contentType = skeResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        
        const skeJson = await skeResponse.json();
        const dragonBonesName = skeJson.name; // DragonBones 데이터의 고유 이름
        // console.log(`✓ [${characterId || 'Character'}] Skeleton loaded:`, dragonBonesName);

        if (destroyed) return;

        // 2. 텍스처 로드
        // console.log(`🔍 [${characterId || 'Character'}] Loading textures from:`, assetDir);

        const texturePromises = parts.map(async (name) => {
          const path = assetDir + `${name}.png`;
          try {
            const texture = await PIXI.Assets.load(path);
            // console.log(`  ✓ [${characterId || 'Character'}] Loaded: ${name}`);
            return { name, texture, success: true };
          } catch (err) {
            console.error(`  ✗ [${characterId || 'Character'}] Failed: ${name} - ${err.message}`);
            // return { name, texture: null, success: false, error: err };
          }
        });

        const loadedTextures = await Promise.all(texturePromises);
        
        const failedParts = loadedTextures.filter(t => !t.success);
        if (failedParts.length > 0) {
          const failedNames = failedParts.map(p => p.name).join(", ");
          throw new Error(`Failed to load texture files: ${failedNames}`);
        }

        if (destroyed) return;

        // 3. DragonBones 데이터 파싱 (중복 체크)
        // 이미 등록된 DragonBones 데이터인지 확인
        if (!factory.getDragonBonesData(dragonBonesName)) {
          factory.parseDragonBonesData(skeJson);
          // console.log(`✓ [${characterId || 'Character'}] DragonBones data parsed: ${dragonBonesName}`);
        } else {
          // console.log(`ℹ️ [${characterId || 'Character'}] DragonBones data already exists: ${dragonBonesName}`);
        }

        const armatureName = skeJson.armature[0]?.name;
        
        if (!armatureName) {
          throw new Error("No armature found in skeleton data");
        }

        const armatureDisplay = factory.buildArmatureDisplay(armatureName, dragonBonesName);
        
        if (!armatureDisplay) {
          throw new Error("Failed to build armature display");
        }

        // 4. 각 파츠에 텍스처 적용
        parts.forEach(slotName => {
          const slot = armatureDisplay.armature.getSlot(slotName);
          if (slot) {
            const textureData = loadedTextures.find(t => t.name === slotName);
            if (textureData?.texture) {
              const sprite = new PIXI.Sprite(textureData.texture);
              sprite.anchor.set(0.5);
              slot.setDisplay(sprite, true);
            } else {
              // console.warn(`[${characterId || 'Character'}] Slot ${slotName} exists but texture not found`);
            }
          } else {
            // console.warn(`[${characterId || 'Character'}] Slot ${slotName} not found in armature`);
          }
        });

        // 5. 위치 설정
        if (position) {
          armatureDisplay.x = position.x;
          armatureDisplay.y = position.y;
        } else {
          armatureDisplay.x = (app.screen?.width ?? baseWidth) / 2;
          armatureDisplay.y = (app.screen?.height ?? baseHeight) / 2;
        }

        // 6. 스케일 설정
        const finalScale = scale ?? getScale(app.screen.width, app.screen.height, baseWidth, baseHeight);
        armatureDisplay.scale.set(finalScale);

        // 7. 애니메이션 재생
        armatureDisplay.animation.play(initialAnimation, loop ? -1 : 1);

        // 컨테이너에 추가
        container.addChild(armatureDisplay);
        armatureDisplayRef.current = armatureDisplay;

        // console.log(`✅ [${characterId || 'Character'}] Loaded successfully at (${armatureDisplay.x}, ${armatureDisplay.y})`);
        
        if (onLoaded) {
          onLoaded(armatureDisplay);
        }
      } catch (error) {
        console.error(`❌ [${characterId || 'Character'}] Failed to load:`, error);
        if (onError) {
          onError(error);
        }
      }
    })();

    return () => {
      destroyed = true;
      
      // 클린업: 컨테이너와 아마추어 모두 제거
      if (armatureDisplayRef.current) {
        armatureDisplayRef.current.destroy();
        armatureDisplayRef.current = null;
      }
      
      if (containerRef.current) {
        app.stage.removeChild(containerRef.current);
        containerRef.current.destroy({ children: true });
        containerRef.current = null;
      }
      
      // console.log(`🗑️ [${characterId || 'Character'}] Cleaned up`);
    };
  }, [app, assetDir, characterUrl, baseWidth, baseHeight, parts, initialAnimation, position, scale, loop, onLoaded, onError, characterId]);

  return null;
};

function getScale(appWidth, appHeight, baseWidth, baseHeight) {
  const scaleX = appWidth / baseWidth;
  const scaleY = appHeight / baseHeight;
  return Math.min(scaleX, scaleY);
}

export default DragonBonesComponent;
