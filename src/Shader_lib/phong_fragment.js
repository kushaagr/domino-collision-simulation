export const phongfragmentsrc = `
    uniform vec3 lightPosition;
    uniform vec3 baseColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(lightPosition - vPosition);

      float diff = max(dot(normal, lightDir), 0.0);

      vec3 viewDir = normalize(-vPosition);
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0); // specular exponent

      vec3 color = baseColor * diff + vec3(1.0) * spec * 0.5;
      gl_FragColor = vec4(color, 1.0);
    }
`;