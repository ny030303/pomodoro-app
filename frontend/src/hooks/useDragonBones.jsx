import React, { useState, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { PixiFactory } from '@md5crypt/dragonbones-pixi';

export const useDragonBones = (armatureName = 'Armature') => {
    const [armature, setArmature] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const factory = PixiFactory.factory;
        const ASSET_URLS = {
            ske: '/assets/character_ske.json',
            tex: '/assets/character_tex.json',
            png: '/assets/character_tex.png',
        };

        const isDataParsed = factory.getDragonBonesData(armatureName);
        if (isDataParsed) {
            const existingArmature = factory.buildArmatureDisplay(armatureName);
            setArmature(existingArmature);
            setIsLoading(false);
            return;
        }

        PIXI.Assets.load([ASSET_URLS.ske, ASSET_URLS.tex, ASSET_URLS.png])
            .then((resources) => {
                // resources 가 Map 이거나 가능성 체크
                console.log('Loaded resources keys:', Object.keys(resources));
                const skeResource = resources['/assets/character_ske.json'];
                const texResource = resources['/assets/character_tex.json'];
                const pngResource = resources['/assets/character_tex.png'];
                console.log('skeResource:', skeResource, 'texResource:', texResource, 'pngResource:', pngResource);

                const skeData = skeResource?.data ? (
                    typeof skeResource.data === 'string' ? JSON.parse(skeResource.data) : skeResource.data
                ) : skeResource;

                if (!skeData) {
                    console.error('skeData null or undefined', skeResource);
                    return;
                }
                if (!texResource || !pngResource) {
                    console.error('texResource or pngResource undefined!', { texResource, pngResource });
                    return;
                }


                factory.parseDragonBonesData(skeData, 'character');
                factory.parseTextureAtlasData(texResource, pngResource);


                const newArmature = factory.buildArmatureDisplay(armatureName);

                if (!newArmature) {
                    console.error('Failed to build armature display. Check armatureName:', armatureName);
                }

                setArmature(newArmature);
            })
            .catch(console.error)
            .finally(() => {
                setIsLoading(false);
            });



    }, [armatureName]);

    return { armature, isLoading };
};
