// src/features/santacasa/operacao/config/operacaoPage.config.js
export const OPERACAO_PAGE = Object.freeze({
  page: {
    titleId: "operacao-title",
  },

  header: {
    eyebrow: "Santa Casa",
    title: "Operação diária",
    description:
      "Gere medicação habitual, receitas, medicamentos não sujeitos a receita médica e vendas suspensas. A partir daqui podes adicionar Medicamentos e quantidades ao pedido geral para enviar à Farmácia.",
    refreshLabel: "Atualizar operação",
    refreshingLabel: "A atualizar...",
  },

  selectedUtente: {
    eyebrow: "Utente selecionado",
    titleFallback: "Seleciona um utente",
    descriptionFallback:
      "Escolhe um utente para carregar medicação habitual, receitas, medicamentos não sujeitos a receita médica e vendas suspensas.",
    numberLabel: "Número de utente",
  },

  sections: {
    medicacaoHabitual: {
      id: "operacao-medicacao-habitual",
      tone: "habitual",
      eyebrow: "Medicação habitual",
      title: "Medicação habitual do utente",
      description:
        "Regista medicamentos usados com frequência para acelerar o preenchimento das receitas, medicamentos não sujeitos a receita médica e medicamentos para venda suspensa.",
    },

    receitas: {
      id: "operacao-receitas",
      tone: "receitas",
      eyebrow: "Receitas",
      title: "Receitas do utente",
      description:
        "Cria receitas, seleciona medicamentos para o pedido geral ou remove medicamentos ainda removíveis.",
    },

    semReceita: {
      id: "operacao-sem-receita",
      tone: "semReceita",
      eyebrow: "Medicamentos não sujeitos a receita médica",
      title: "Medicamentos não sujeitos a receita médica",
      description:
        "Adiciona medicamentos não sujeitos a receita médica, seleciona para o pedido geral ou remove registos ainda removíveis.",
    },

    extras: {
      id: "operacao-extras",
      tone: "extras",
      eyebrow: "Vendas Suspensas",
      title: "Vendas Suspensas",
      description:
        "Cria vendas suspensas, seleciona para o pedido geral ou remove registos ainda removíveis.",
    },
  },
});
