export const blinnphongfragmentsrc = `
    precision highp float;

uniform int numLights;
uniform vec3 lightPositions[10];
uniform vec3 lightColors[10];

uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;
uniform vec3 ambientColor;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 finalColor = ambientColor * diffuseColor;

  for (int i = 0; i < 10; i++) {
    if (i >= numLights) break;

    vec3 lightDir = normalize(lightPositions[i] - vViewPosition);
    vec3 halfwayDir = normalize(lightDir + viewDir);

    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);

    vec3 diffuse = diffuseColor * diff * lightColors[i];
    vec3 specular = specularColor * spec * lightColors[i];

    finalColor += diffuse + specular;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}

  `;