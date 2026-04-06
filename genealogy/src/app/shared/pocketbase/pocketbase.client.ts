import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://api.ibrstv.ru');

// Keep auth token fresh across page reloads
pb.autoCancellation(false);
