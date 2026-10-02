# 像素天氣小鎮

16-bit RPG 風格的即時天氣網站，使用 React、Vite 與 Open-Meteo。

## 本機執行

```bash
npm install
npm run dev
```

## 建置測試

```bash
npm run build
npm run preview
```

## 發布至 GitHub Pages

1. 在 GitHub 建立新的 Public repository。
2. 將本專案所有檔案上傳到 repository 根目錄。
3. Repository Settings → Pages → Source 選擇 GitHub Actions。
4. 推送到 main 後等待 Actions 完成。

## 注意

- 定位功能需要 HTTPS，GitHub Pages 符合此條件。
- 若拒絕定位，網站會繼續顯示台北市。
- 天氣資料來自 Open-Meteo。
