import { Projeto, AreaTematica } from "@prisma/client";

// Enum para as possíveis situações de um projeto (mantido como na versão anterior)
export enum SituacaoProjeto {
  SUBMETIDO = "Submetido",
  EM_AVALIACAO = "Em Avaliação",
  AVALIADO_APROVADO = "Avaliado - Aprovado",
  AVALIADO_REPROVADO = "Avaliado - Reprovado",
  PENDENTE_AJUSTES = "Pendente de Ajustes",
  FINALIZADO = "Finalizado",
  CANCELADO = "Cancelado",
}

// 1. Define CreateProjetoDTO omitindo campos do modelo Prisma.Projeto que:
//    - São gerados automaticamente (id, dataCadastro).
//    - São gerenciados internamente ou têm valores padrão (status).
//    - Pertencem a DTOs específicos de outras operações (nota, parecerDescritivo para avaliação).
//    - São objetos de relação direta que serão substituídos por IDs ou campos customizados (autores, premio, avaliador).
//    - Precisam ser re-tipados (situacao, de string para enum).
//    E então adiciona os campos customizados ou re-tipados.
export type CreateProjetoDTO = Omit<
  Projeto,
  | "id"                // Gerado automaticamente pelo banco
  | "dataCadastro"      // Gerado automaticamente com @default(now())
  | "status"            // Gerenciado internamente, @default(true)
  | "nota"              // Fará parte do UpdateProjetoDTO ou EvaluateProjetoDTO
  | "parecerDescritivo" // Fará parte do UpdateProjetoDTO ou EvaluateProjetoDTO
  | "autores"           // O DTO usará 'autorIds' para a relação
  | "premio"            // O modelo Prisma já tem 'premioId', omitimos o objeto 'premio'
  | "avaliador"         // O modelo Prisma já tem 'avaliadorId', omitimos o objeto 'avaliador'
  | "situacao"          // Omitido para ser re-tipado abaixo com o enum SituacaoProjeto
> & {
  autorIds: number[];          // Campo customizado para os IDs dos autores
  situacao?: SituacaoProjeto;  // Campo 'situacao' re-tipado com o enum, opcional na criação
};
// Com base no Omit, CreateProjetoDTO efetivamente incluirá de Projeto:
// - titulo: string
// - areaTematica: AreaTematica
// - resumo: string
// - premioId: number
// - avaliadorId: number
// E adicionará:
// - autorIds: number[]
// - situacao?: SituacaoProjeto


// 2. Define UpdateProjetoDTO usando Partial em CreateProjetoDTO.
//    Isso torna todos os campos definidos em CreateProjetoDTO opcionais para atualização.
//    Adicionalmente, mesclamos campos que são relevantes para atualização mas não
//    necessariamente para criação inicial (como nota, parecerDescritivo, status).
export type UpdateProjetoDTO = Partial<CreateProjetoDTO> & {
  nota?: number | null;            // Para atualizar a nota da avaliação (pode ser nula)
  parecerDescritivo?: string | null; // Para atualizar o parecer (pode ser nulo)
  status?: boolean;                // Para permitir a ativação/inativação (soft delete)
};
// UpdateProjetoDTO efetivamente terá todos os campos de CreateProjetoDTO como opcionais,
// mais os campos nota, parecerDescritivo e status também opcionais.


// 3. DTO específico para o processo de avaliação de um projeto (mantido como na versão anterior)
export type EvaluateProjetoDTO = {
  nota: number;
  parecerDescritivo: string;
  situacao: SituacaoProjeto; // Ex: AVALIADO_APROVADO, AVALIADO_REPROVADO, PENDENTE_AJUSTES
};
