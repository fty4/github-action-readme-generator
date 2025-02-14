import Inputs, { configKeys } from './inputs';
import LogTask from './logtask';

// This script rebuilds the usage section in the README.md to be consistent with the action.yml
export default function save(inputs: Inputs): void {
  const log = new LogTask('save');
  if (inputs.config.get('save').toString() === 'true') {
    for (const k of Object.keys(configKeys)) {
      inputs.config.set(k, inputs.config.get(k));
    }
    inputs.config.save((err: any) => {
      if (err && 'message' in err && err.message) {
        log.error(err.message as string);
        return;
      }
      log.info('Configuration saved successfully.');
    });
  }
}
