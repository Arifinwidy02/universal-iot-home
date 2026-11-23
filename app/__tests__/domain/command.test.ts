import { commandToPayload } from '../../src/domain/command';

describe('commandToPayload', () => {
  it('maps each command to the partial state object the simulator expects', () => {
    expect(commandToPayload({ kind: 'setPower', on: true })).toEqual({
      on: true,
    });
    expect(commandToPayload({ kind: 'setBrightness', brightness: 40 })).toEqual(
      {
        brightness: 40,
      },
    );
  });
});
