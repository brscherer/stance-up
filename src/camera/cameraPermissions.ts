export async function requestCameraPermission(
  constraints: MediaStreamConstraints = { video: { facingMode: 'user' } }
): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          throw new Error('Camera permission denied. Please allow camera access in your browser settings.', { cause: error });
        case 'NotFoundError':
          throw new Error('No camera found. Please connect a camera device.', { cause: error });
        case 'NotReadableError':
          throw new Error('Camera is already in use by another application.', { cause: error });
        case 'OverconstrainedError':
          throw new Error('Camera does not meet the required constraints.', { cause: error });
        default:
          throw new Error(`Camera error: ${error.message}`, { cause: error });
      }
    }
    throw error;
  }
}

export async function enumerateCameras(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'videoinput');
}

export function stopCameraStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
