/**
 * Пути к необязательным файлам.
 * Пустая строка = использовать встроенную заглушку и не запрашивать файл.
 * Музыка: public/audio/geroi-3-main-menu.mp3
 * Шаги: public/audio/hooves.mp3 — играет, пока всадник едет.
 * Конь: public/models/horse.glb — Quaternius, CC0. Всадник: public/models/adventurer.glb.
 * Свою модель можно подставить в heroModel.
 */
export const assetFiles = {
  heroModel: '/models/horse.glb',
  heroScale: 1,
  music: '/audio/geroi-3-main-menu.mp3',
  hooves: '/audio/hooves.mp3',
}
