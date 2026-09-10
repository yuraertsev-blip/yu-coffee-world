export function canOccupy(x,z,colliders,bounds,radius=.22){
 if(Math.abs(x)>=bounds.x||Math.abs(z)>=bounds.z)return false;
 return !colliders.some(c=>x>c.minX-radius&&x<c.maxX+radius&&z>c.minZ-radius&&z<c.maxZ+radius);
}
