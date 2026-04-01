import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes no GitHub Pages', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // ESPERA O APP REALMENTE CARREGAR
    await page.waitForSelector('#nome');
  });

  test('tabela inicia vazia', async ({ page }) => {
    await expect(page.locator('td.texto-central'))
      .toHaveText('Nenhum aluno cadastrado.');
  });

  test('cadastrar aluno válido', async ({ page }) => {
    await page.fill('#nome', 'João Silva');
    await page.fill('#nota1', '7');
    await page.fill('#nota2', '8');
    await page.fill('#nota3', '6');

    await page.click('button[type="submit"]');

    await expect(page.locator('#tabela-alunos tbody'))
      .toContainText('João Silva');
  });

  test('buscar aluno', async ({ page }) => {
    await page.fill('#nome', 'Carlos');
    await page.fill('#nota1', '7');
    await page.fill('#nota2', '7');
    await page.fill('#nota3', '7');
    await page.click('button[type="submit"]');

    await page.fill('#nome', 'Mariana');
    await page.fill('#nota1', '8');
    await page.fill('#nota2', '8');
    await page.fill('#nota3', '8');
    await page.click('button[type="submit"]');

    await page.fill('#busca', 'Carlos');

    await expect(page.locator('#tabela-alunos tbody tr'))
      .toHaveCount(1);
  });

  test('excluir aluno', async ({ page }) => {
    await page.fill('#nome', 'Excluir Eu');
    await page.fill('#nota1', '7');
    await page.fill('#nota2', '7');
    await page.fill('#nota3', '7');
    await page.click('button[type="submit"]');

    await page.click('button[aria-label="Excluir Excluir Eu"]');

    await expect(page.locator('td.texto-central')).toBeVisible();
  });

  test('estatísticas corretas', async ({ page }) => {
    const dados = [
      ['A', '8', '8', '8'],
      ['B', '6', '5', '6'],
      ['C', '2', '3', '4'],
    ];

    for (const [nome, n1, n2, n3] of dados) {
      await page.fill('#nome', nome);
      await page.fill('#nota1', n1);
      await page.fill('#nota2', n2);
      await page.fill('#nota3', n3);
      await page.click('button[type="submit"]');
    }

    await expect(page.locator('#stat-total')).toHaveText('3');
  });

  // TESTE QUE VAI FALHAR (bug da média)

  test('calcular média correta (bug intencional)', async ({ page }) => {
    await page.fill('#nome', 'Pedro');
    await page.fill('#nota1', '8');
    await page.fill('#nota2', '6');
    await page.fill('#nota3', '10');

    await page.click('button[type="submit"]');

    await expect(page.locator('#tabela-alunos tbody tr td').nth(4))
      .toHaveText('8.00');
  });

});