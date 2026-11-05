import { TestBed } from '@angular/core/testing';

const platform = vi.hoisted(() => ({ getPlatform: vi.fn() }));
const foldable = vi.hoisted(() => ({ isDeviceFoldable: vi.fn(), addListener: vi.fn() }));
const layout = vi.hoisted(() => ({ resolve: vi.fn(), apply: vi.fn() }));
vi.mock('@capacitor/core', () => ({ Capacitor: platform }));
vi.mock('@erkamyaman/capacitor-foldable', () => ({ Foldable: foldable }));
vi.mock('@rdlabo/capacitor-native-ui/integration', () => ({ resolveVerticalBarsLayout: layout.resolve }));
vi.mock('@rdlabo/ionic-theme-ios27', () => ({ setVerticalBarsLayout: layout.apply }));

import { DuoModeService } from './duo-mode.service';

describe('Duo demo mode', () => {
  let changed: () => void;
  const remove = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    platform.getPlatform.mockReturnValue('ios');
    foldable.isDeviceFoldable.mockResolvedValue({ foldable: false });
    remove.mockResolvedValue(undefined);
    foldable.addListener.mockImplementation(async (_event, callback) => {
      changed = callback;
      return { remove };
    });
  });

  for (const name of ['web', 'ios']) {
    it(`keeps preview on/off available on ordinary ${name}`, async () => {
      platform.getPlatform.mockReturnValue(name);
      const service = TestBed.inject(DuoModeService);
      await service.initialize();
      service.setPreview(true);
      expect(service.previewEnabled()).toBe(true);
      service.setPreview(false);
      expect(service.previewEnabled()).toBe(false);
      expect(service.isDuoDevice()).toBe(false);
      expect(layout.apply.mock.calls).toEqual([[{ edge: 'trailing' }], [{ edge: null }]]);
      expect(foldable.addListener).toHaveBeenCalledTimes(name === 'ios' ? 1 : 0);
      expect(layout.resolve).not.toHaveBeenCalled();
    });
  }

  it('automatically follows actual Duo geometry, including a layout without a side rail', async () => {
    foldable.isDeviceFoldable.mockResolvedValue({ foldable: true });
    const outer = { edge: 'trailing', inset: 84, toolbarTop: 174 };
    layout.resolve.mockResolvedValue(outer);
    const service = TestBed.inject(DuoModeService);
    await service.initialize();
    expect(service.isDuoDevice()).toBe(true);
    expect(layout.resolve).toHaveBeenCalledWith(foldable);
    expect(layout.apply).toHaveBeenLastCalledWith(outer);
    expect(foldable.addListener).toHaveBeenCalledWith('layoutChange', expect.any(Function));
    const inner = { edge: 'leading', inset: 84, toolbarTop: 124 };
    layout.resolve.mockResolvedValue(inner);
    changed();
    await Promise.resolve();
    expect(layout.apply).toHaveBeenLastCalledWith(inner);
    layout.resolve.mockResolvedValue({ edge: null });
    changed();
    await Promise.resolve();
    expect(layout.apply).toHaveBeenLastCalledWith({ edge: null });
    service.setPreview(true);
    expect(layout.apply).toHaveBeenLastCalledWith({ edge: null });
    expect(service.isDuoDevice()).toBe(true);
    TestBed.resetTestingModule();
    expect(remove).toHaveBeenCalledOnce();
  });

  it('detects Duo after reserved regions become available following bootstrap', async () => {
    const service = TestBed.inject(DuoModeService);
    await service.initialize();
    expect(service.isDuoDevice()).toBe(false);
    foldable.isDeviceFoldable.mockResolvedValue({ foldable: true });
    layout.resolve.mockResolvedValue({ edge: 'leading', inset: 84, toolbarTop: 82 });
    changed();
    await vi.waitFor(() => expect(layout.apply).toHaveBeenCalledWith({ edge: 'leading', inset: 84, toolbarTop: 82 }));
    expect(service.isDuoDevice()).toBe(true);
  });

  it('discards an older device read when a newer layout has arrived', async () => {
    foldable.isDeviceFoldable.mockResolvedValue({ foldable: true });
    let complete!: (value: unknown) => void;
    layout.resolve.mockReturnValueOnce(new Promise((resolve) => (complete = resolve)));
    const service = TestBed.inject(DuoModeService);
    const initialized = service.initialize();
    await vi.waitFor(() => expect(layout.resolve).toHaveBeenCalledOnce());
    layout.resolve.mockResolvedValue({ edge: 'leading', toolbarTop: 124 });
    changed();
    await Promise.resolve();
    complete({ edge: 'trailing', toolbarTop: 174 });
    await initialized;
    expect(layout.apply).toHaveBeenCalledExactlyOnceWith({ edge: 'leading', toolbarTop: 124 });
  });
});
