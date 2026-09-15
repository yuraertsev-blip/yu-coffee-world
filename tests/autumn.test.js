import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import * as T from 'three';
import {GUEST_PROFILES,cleanAvatar} from '../src/guest-profiles.js';
import {createCandle,AUTUMN_LIGHT} from '../src/autumn.js';
test('five women, five men and five distinct animal avatars have actual rendered portraits',()=>{assert.equal(new Set(GUEST_PROFILES.map(p=>p.id)).size,15);for(const category of ['women','men','animals'])assert.equal(GUEST_PROFILES.filter(p=>p.category===category).length,5);assert.equal(new Set(GUEST_PROFILES.filter(p=>p.animal).map(p=>p.animal)).size,5);for(const p of GUEST_PROFILES){assert.equal(cleanAvatar(p.id),p.id);assert.ok(existsSync(new URL('../public/avatars/'+p.id+'.png',import.meta.url)));}});
test('candle sits on the other tabletop and flickers within a restrained range',()=>{const scene=new T.Scene(),c=createCandle(scene);assert.deepEqual(c.root.position.toArray(),[1.12,.709,1.25]);assert.ok(c.root.getObjectByName('round-glass-bowl').material.transparent);const flame=c.root.getObjectByName('living-candle-flame'),start=flame.scale.y;for(let n=0;n<60;n++)c.update(1/60);assert.notEqual(flame.scale.y,start);assert.ok(flame.scale.y>.018&&flame.scale.y<.026);assert.ok(AUTUMN_LIGHT.day.lamp<9&&AUTUMN_LIGHT.night.lamp<12);});
