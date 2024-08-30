import { test, expect } from "@playwright/test";

import { gotoHome, navigateToHelpDialog } from "../navigators";

test.beforeEach(gotoHome);

test("「ヘルプ」メニューから各項目をクリックすると、その項目の内容が表示される", async ({
  page,
}) => {
  await navigateToHelpDialog(page);

  // アップデート情報
  await page.getByText("アップデート情報", { exact: true }).click();
  await expect(page.getByText("アップデート情報")).toBeVisible();

  // 使い方
  await page.getByText("使い方", { exact: true }).click();
  await expect(page.getByText("使い方")).toBeVisible();

  // よくある質問
  await page.getByText("よくある質問 / Q&A", { exact: true }).click();
  await expect(page.getByText("よくある質問 / Q&A")).toBeVisible();

  // 音声合成モデルのライセンス
  await page.getByText("音声合成モデルのライセンス", { exact: true }).click();
  await expect(page.getByText("音声合成モデルのライセンス")).toBeVisible();

  // ライセンス情報
  await page.getByText("ライセンス情報", { exact: true }).click();
  await expect(page.getByText("ライセンス情報")).toBeVisible();

  // ライセンス情報
  await page.getByText("オープンソースライセンス", { exact: true }).click();
  await expect(page.getByText("オープンソースライセンス")).toBeVisible();

  // お問い合わせ
  await page.getByText("お問い合わせ").click();
  await expect(page.getByText("お問い合わせ")).toBeVisible();
});
