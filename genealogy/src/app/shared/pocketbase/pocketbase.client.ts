import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://194.87.151.177:8090');

// Keep auth token fresh across page reloads
pb.autoCancellation(false);
