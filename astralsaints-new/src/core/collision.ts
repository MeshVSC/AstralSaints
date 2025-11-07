// Collision detection logic
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkCollision(a: GameObject, b: GameObject): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function isOutOfBounds(obj: GameObject, bounds: { width: number; height: number }): boolean {
  return obj.x < -50 || obj.x > bounds.width + 50 || obj.y < -50 || obj.y > bounds.height + 50;
}
