import { getNewrelicScriptBlock } from '~/utils/newrelic-config';
import { describe, expect, it } from 'vitest';

describe('getNewrelicScriptBlock', () => {
  it('should return the correct script block for DEV environment', () => {
    const result = getNewrelicScriptBlock('DEV');
    expect(result).toEqual([
      {
        hid: 'newRelic',
        src: '/new-relic-dev.js',
        defer: true,
        type: 'text/javascript',
      },
    ]);
  });

  it('should return the correct script block for UAT environment', () => {
    const result = getNewrelicScriptBlock('UAT');
    expect(result).toEqual([
      {
        hid: 'newRelic',
        src: '/new-relic-uat.js',
        defer: true,
        type: 'text/javascript',
      },
    ]);
  });

  it('should return the correct script block for PROD environment', () => {
    const result = getNewrelicScriptBlock('PROD');
    expect(result).toEqual([
      {
        hid: 'newRelic',
        src: '/new-relic-prod.js',
        defer: true,
        type: 'text/javascript',
      },
    ]);
  });

  it('should return an empty src path for an unknown environment', () => {
    const result = getNewrelicScriptBlock('UNKNOWN');
    expect(result).toEqual([
      {
        hid: 'newRelic',
        src: '',
        defer: true,
        type: 'text/javascript',
      },
    ]);
  });
});
