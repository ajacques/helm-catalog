import fs from 'fs';
import yaml from 'js-yaml';

type Service = { command?: string, image: string };
const doc: { services: Service[] } = yaml.load(fs.readFileSync('../../self-hosted/docker-compose.yml', 'utf8')) as any;
let output = fs.openSync('../sentry/templates/generated1.yaml', 'w');
const templates = {
  sentry: fs.readFileSync('raw_templates/sentry.yaml', 'utf8') as any as string,
  snuba: fs.readFileSync('raw_templates/snuba.yaml', 'utf8') as any as string,
};
let bytesWritten = 0;
let fileIndex = 1;
const LIMIT = 3145728;

function emitArgs(args: string, indent: number = 8) {
  const indentStr = ' '.repeat(indent);
  return "\n" + args.split(' ').map(arg => {
    if (arg.match('^[0-9]')) {
      arg = `'${arg}'`;
    }
    return `${indentStr}- ${arg}`
  }).join('\n');
}

function emitService(name: string, service: Service, serviceType: keyof typeof templates) {
  let str = templates[serviceType].replaceAll("_NAME_", name);
  if (service.command) {
    str = str.replace("_ARGS_", emitArgs(service.command));
  } else {
    str = str.replace("_ARGS_", "[]");
  }
  const recordDelimiter = '---\n';
  const bytesToWrite = str.length + recordDelimiter.length;

  if (bytesWritten + str.length + 4 > LIMIT) {
    fs.closeSync(output);
    output = fs.openSync(`../sentry/templates/generated${++fileIndex}.yaml`, 'w');
  }
  bytesWritten += bytesToWrite;

  fs.writeSync(output, recordDelimiter);
  fs.writeSync(output, str);
}

for (const [name, service] of Object.entries(doc.services)) {
  if (service.image === 'sentry-self-hosted-local') {
    if (['web', 'cron', 'worker'].includes(name)) {
      continue;
    }
    emitService(name, service, 'sentry');
  } else if (service.image == "$SNUBA_IMAGE") {
    if (['snuba-api'].includes(name)) {
      continue;
    }
    emitService(name, service, 'snuba');
  } else {
    console.log(`Encountered unexpected type ${name}: ${service.image}`);
  }
}

