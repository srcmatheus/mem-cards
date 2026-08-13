# Diretrizes do Workflow do Agente

1. **Ciclo de Edição e Commit:** Sempre que você concluir uma alteração de código, criação de componente ou correção de bug com sucesso:
   - Execute o comando de staging (`git add .`).
   - Crie um `git commit` com uma mensagem clara no padrão Conventional Commits (ex: `feat:`, `fix:`, `style:`).
2. **Revisão Obrigatória:** Solicite autorização e aprovação no terminal antes de executar qualquer comando Git que altere o histórico (`git commit`) ou envie alterações para o servidor remoto (`git push`).