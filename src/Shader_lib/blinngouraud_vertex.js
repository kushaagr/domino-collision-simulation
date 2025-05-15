export const blinngouraudvertexsrc = `
uniform int numLights;
uniform vec3 lightPositions[10];
uniform vec3 lightColors[10];

uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 ambientColor;
uniform float shininess;

varying vec3 vColor;

void main() {
  vec3 normal = normalize(normalMatrix * normal);
  vec3 pos = (modelViewMatrix * vec4(position, 1.0)).xyz;

  vec3 accumulatedColor = ambientColor * diffuseColor;

  for (int i = 0; i < 10; i++) {
    if (i >= numLights) break;

    vec3 lightDir = normalize(lightPositions[i] - pos);
    vec3 viewDir = normalize(-pos);
    vec3 halfDir = normalize(lightDir + viewDir);

    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, halfDir), 0.0), shininess);

    vec3 lightContribution = (diffuseColor * diff + specularColor * spec) * lightColors[i];

    accumulatedColor += lightContribution;
  }

  vColor = accumulatedColor;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;