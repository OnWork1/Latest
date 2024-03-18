export function getNewrelicScriptBlock(env: string) {
  let srcPath: string = '';
  switch (env.toUpperCase()) {
    case 'DEV':
      srcPath = `/new-relic-dev.js`;
      break;
    case 'UAT':
      srcPath = `/new-relic-uat.js`;
      break;
    case 'PROD':
      srcPath = `/new-relic-prod.js`;
      break;
    default:
      break;
  }

  return [
    {
      hid: 'newRelic',
      src: srcPath,
      defer: true,
      type: 'text/javascript',
    },
  ];
}
