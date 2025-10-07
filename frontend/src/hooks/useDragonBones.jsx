import React, { useState, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { PixiFactory } from '@md5crypt/dragonbones-pixi';

window.PIXI = PixiFactory;
/**
 * DragonBones 에셋을 로드하고 ArmatureDisplay 객체를 생성하는 커스텀 훅
 * @param {string} armatureName - DragonBones 프로젝트의 Armature 이름
 * @returns {{armature: PIXI.DisplayObject | null, isLoading: boolean}}
 */
export const useDragonBones = (armatureName = 'Armature') => {
    const [dragonBones, setDragonBones] = useState(null);
    const [armature, setArmature] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const factoryRef = React.useRef(null);

    // useEffect(() => {
    //     import('pixi-dragonbones').then((module) => {
    //         window.dragonBones = module.default;  // 중요: 전역에 dragonBones 할당
    //         setDragonBones(module.default);
    //         console.log('dragonBones loaded:', window.dragonBones);
    //         console.log('PixiFactory:', window.dragonBones && window.dragonBones.PixiFactory);
            
    //     });
    // }, []);

    useEffect(() => {
        if (!window.dragonBones || !window.dragonBones.PixiFactory || window.PIXI) return;

        
        if (!('shared' in window.PIXI)) {
        // 안전한 확장 가능한 객체를 새로 생성 후 할당
        window.PIXI = Object.assign({}, window.PIXI, { shared: {} });
        }


        const factory = new window.dragonBones.PixiFactory();

        // 팩토리 인스턴스를 직접 생성
        
        const ASSET_URLS = {
            ske: '/assets/character_ske.json',
            tex: '/assets/character_tex.json',
            png: '/assets/character_tex.png',
        };

        const isDataParsed = factory.getDragonBonesData(armatureName);
        if (isDataParsed) {
            const newArmature = factory.buildArmatureDisplay(armatureName);
            setArmature(newArmature);
            setIsLoading(false);
            return;
        }

        PIXI.Assets.load([ASSET_URLS.ske, ASSET_URLS.tex, ASSET_URLS.png]).then(resources => {
            console.log(resources); // 실제 키값 확인용

            const skeResource = resources[ASSET_URLS.ske];
            const texResource = resources[ASSET_URLS.tex];
            const pngResource = resources[ASSET_URLS.png];
            if (skeResource && texResource && pngResource) {
                factory.parseDragonBonesData(skeResource.data, armatureName);
                factory.parseTextureAtlasData(texResource.data, pngResource);
                const newArmature = factory.buildArmatureDisplay(armatureName);
                setArmature(newArmature);
            } else {
                console.error('DragonBones assets not loaded correctly:', { ske, tex, png });
            }
        }).catch(console.error).finally(() => setIsLoading(false));

    }, [dragonBones, armatureName]);

    return { armature, isLoading };
};
