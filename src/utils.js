export function handleTextEnv(envText, isComma){
  let env = {};
  const delimiter = isComma ? ',' : '\n';
  envText.split(delimiter).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        env[key.trim().toUpperCase()] = value;
      }
    }
  });
  return env;
}

export function validateEnvVars(configEnv) {
  const requiredEnvVars = ['APIKEY', 'AUTHDOMAIN', 'PROJECTID', 'STORAGEBUCKET', 'MESSAGINGSENDERID', 'APPID'];
  const missingVars = requiredEnvVars.filter(varName => !configEnv[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}