import * as T from 'three';
// Smooth elliptical rings form continuous cloth/limb surfaces instead of balls.
export function tailoredSurface(rings,segments=40){
 const curve=new T.CatmullRomCurve3(rings.map(([y,x,z])=>new T.Vector3(x,y,z))),positions=[],uvs=[],indices=[],rows=rings.length*5;
 for(let row=0;row<=rows;row++){const p=curve.getPoint(row/rows);for(let j=0;j<=segments;j++){const a=j/segments*Math.PI*2;positions.push(Math.sin(a)*p.x,p.y,Math.cos(a)*p.z);uvs.push(j/segments,row/rows);}}
 for(let r=0;r<rows;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;if(rings.at(-1)[0]>rings[0][0])indices.push(a,a+1,b,b,a+1,b+1);else indices.push(a,b,a+1,b,b+1,a+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export function sculptedHead(index){
 const geo=new T.SphereGeometry(1,96,72),p=geo.attributes.position,uv=geo.attributes.uv;
 const widths=[.13,.127,.12],gauss=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2));
 for(let i=0;i<p.count;i++){
  let x=p.getX(i)*widths[index],y=p.getY(i)*.173,z=p.getZ(i)*.118;
  // Narrow lower jaw, a real nose bridge/tip, lips, cheekbones and eye sockets.
  x*=1-.17*Math.max(0,(-y-.015)/.158);
  if(z>0){const w=T.MathUtils.smoothstep(z,0,.07);
   z+=w*(.014*gauss(x,y,0,-.010,.012,.042)+.010*gauss(x,y,0,-.035,.016,.014)+.007*gauss(x,y,0,-.085,.039,.014)+.009*gauss(x,y,0,-.137,.037,.026));
   for(const side of [-1,1])z+=w*(.007*gauss(x,y,side*.065,-.04,.035,.033)-.006*gauss(x,y,side*.052,.026,.025,.018));
  }
  p.setXYZ(i,x,y,z+.021);uv.setXY(i,.5+x/.27,.5+y/.346);
 }
 geo.computeVertexNormals();return geo;
}

// Continuous scalp with a shaped hairline: forehead, temples and nape belong
// to one surface, avoiding a cap edge and detached back-of-head spheres.
export function hairShell(index){
 const positions=[],uvs=[],indices=[],rows=36,cols=96;
 for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
  const a=c/cols*Math.PI*2,front=(Math.cos(a)+1)/2;
  const limit=2.5-(index===2?1.08:1.35)*Math.pow(front,2.8)+.035*Math.sin(a*3);
  const t=.012+(r/rows)*limit,sweep=index===2?0:.008*Math.sin(t)*Math.sin(a+.6);
  positions.push(Math.sin(a)*Math.sin(t)*.136+sweep,Math.cos(t)*.183+.011,Math.cos(a)*Math.sin(t)*.135-.015);
  uvs.push(c/cols,r/rows);
 }
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}

// Tapered sculpted locks: broad at the crown, fine pointed tips, full depth.
export function animeHairLock(points,width=.012){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),geo=new T.TubeGeometry(curve,28,1,8,false),frames=curve.computeFrenetFrames(28,false),p=geo.attributes.position;
 for(let row=0;row<=28;row++){const t=row/28,center=curve.getPointAt(t),r=width*(.38+Math.sin(Math.PI*t)*.62)*Math.max(.035,Math.pow(1-t,.35));for(let j=0;j<=8;j++){const a=j/8*Math.PI*2,v=center.clone().addScaledVector(frames.normals[row],-Math.cos(a)*r).addScaledVector(frames.binormals[row],Math.sin(a)*r*.48);p.setXYZ(row*9+j,v.x,v.y,v.z);}}
 geo.computeVertexNormals();return geo;
}
