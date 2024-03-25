import { test, expect } from "@playwright/test";

import { gotoHome, navigateToMain } from "../navigators";

test.beforeEach(gotoHome);

test("「設定」→「キャラクター並び替え・視聴」で「キャラクター並び替え・視聴」ページが表示される", async ({
  page,
}) => {
  await navigateToMain(page);
  await page.getByText("設定").click();
  await page.waitForTimeout(100);
  await page.getByText("音声合成モデルの管理").click();
  await page.waitForTimeout(100);
  await expect(page.getByText("音声合成モデルの管理")).toBeVisible();
});
