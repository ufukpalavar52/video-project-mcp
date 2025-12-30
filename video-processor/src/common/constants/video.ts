export const VideoStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

export const VideoProcessType = {
  GIF: 'GIF',
  CUT: 'CUT',
  VIDEO: 'VIDEO',
};

export type defVideoStatus = keyof typeof VideoStatus;
export type defVideoProcessType = keyof typeof VideoProcessType;

export function getVideoStatus(str: string, defVal?: defVideoStatus) {
  if (!str) return defVal ? defVal : '';

  const upperStr = str.toUpperCase();
  if (upperStr in VideoStatus) {
    return VideoStatus[upperStr as keyof typeof VideoStatus];
  }

  return defVal ? defVal : '';
}

export function getVideoProcessType(str: string, defVal?: defVideoProcessType) {
  if (!str) return defVal ? defVal : '';

  const upperStr = str.toUpperCase();
  if (upperStr in VideoProcessType) {
    return VideoProcessType[upperStr as keyof typeof VideoProcessType];
  }

  return defVal ? defVal : '';
}
