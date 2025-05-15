export const gouradvertexsrc = `
 varying vec3 vColor;
    uniform vec3 lightPosition;
    uniform vec3 baseColor;

    void main() {
      vec3 normal = normalize(normalMatrix * normal);
      vec3 lightDir = normalize(lightPosition - (modelViewMatrix * vec4(position, 1.0)).xyz);
      float diff = max(dot(normal, lightDir), 0.0);
      vColor = baseColor * diff;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;