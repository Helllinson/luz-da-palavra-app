
import { Volume } from './types';

export const STATUS_GRADIENTS = [
  // ===== CLAROS (light) =====
  { id: "porcelana",  name: "Graça",      tone: "light",   css: "linear-gradient(160deg,#F7F2EA 0%,#EFE7DC 55%,#F9F6F0 100%)" },
  { id: "amanhecer",  name: "Renovo",     tone: "light",   css: "linear-gradient(160deg,#F2F7FF 0%,#E6F0FF 55%,#FFF3E9 100%)" },
  { id: "nuvem",      name: "Paz",        tone: "light",   css: "linear-gradient(160deg,#F6F7FB 0%,#EEF1F6 55%,#F5EFE7 100%)" },
  { id: "salmo",      name: "Refúgio",    tone: "light",   css: "linear-gradient(160deg,#F4FBF8 0%,#E7F3EE 55%,#F7F6F2 100%)" },

  // ===== NEUTROS (neutral) =====
  { id: "areia",      name: "Caminho",    tone: "neutral", css: "linear-gradient(160deg,#D7CFBF 0%,#CFC6B4 55%,#E6E0D4 100%)" },
  { id: "pedra",      name: "Firmeza",    tone: "neutral", css: "linear-gradient(160deg,#C9CFD6 0%,#B8C1CC 55%,#E2E6EC 100%)" },
  { id: "oliva_suave",name: "Esperança",  tone: "neutral", css: "linear-gradient(160deg,#C9D2C8 0%,#AEBCAF 55%,#E7ECE6 100%)" },
  { id: "crepusculo", name: "Silêncio",   tone: "neutral", css: "linear-gradient(160deg,#C9C1C9 0%,#AFA6B5 55%,#E9E3EB 100%)" },

  // ===== ESCUROS (dark) =====
  { id: "noite",      name: "Noite",      tone: "dark",    css: "linear-gradient(160deg,#070A12 0%,#0B1220 45%,#0A2A24 100%)" },
  { id: "carvao",     name: "Profundo",   tone: "dark",    css: "linear-gradient(160deg,#050607 0%,#121416 55%,#07090B 100%)" },
  { id: "oceano",     name: "Oceano",     tone: "dark",    css: "linear-gradient(160deg,#071A2B 0%,#0B2A3C 55%,#0A1A24 100%)" },
  { id: "vinho",      name: "Aliança",    tone: "dark",    css: "linear-gradient(160deg,#14060A 0%,#2A0D18 55%,#11060C 100%)" },
] as const;

export const VOLUMES: Volume[] = [
  {
    id: 1,
    title: "Volume 1",
    subtitle: "Quando a Alma Está Cansada",
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000",
    days: [
      {
        dia: 1,
        titulo: "Quando o Cansaço Não é Só do Corpo",
        versiculo: "“Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.”",
        referencia: "Mateus 11:28",
        leitura: "Há um tipo de cansaço que o sono não resolve.\nO corpo até descansa, mas a mente continua acelerada e o coração segue pesado.\n\nMuitos continuam funcionando por fora, sorrindo, trabalhando e seguindo adiante, enquanto por dentro estão esgotados e carregam um peso silencioso que ninguém vê.\n\nJesus não fez um convite aos fortes. Ele chamou os cansados.\nE isso é profundamente consolador: Cristo não espera que você esteja bem para se aproximar dEle. Ele convida você exatamente como está.\n\nO mundo ensina a suportar, insistir e resistir.\nJesus ensina a vir, descansar e confiar.\n\nDescansar em Cristo não é desistir da vida.\nEs parar de carregar sozinho aquilo que nunca foi feito para você carregar.",
        aplicacao: "Hoje, observe o seu coração com sinceridade:\nVocê tem buscado descanso em soluções humanas, distrações ou controle — ou na presença de Cristo?\n\nEscolha se aproveitar de Jesus antes de tentar carregar tudo sozinho.",
        oracao: "Senhor Jesus,\neu reconheço diante de Ti o meu cansaço.\n\nTenho carregado pesos além das minhas forças, tentado resolver tudo sozinho e seguido em frente mesmo quando a alma pede descanso.\n\nHoje eu atendo ao Teu convite e me aproximo de Ti exatamente como estou.\nEnsina-me a descansar no Teu cuidado.\nAquieta a minha mente, renova o meu interior e fortalece o meu coração cansado.\n\nEu entrego minhas preocupações em Tuas mãos, confiando que Tu cuidas de mim com amor e fidelidade.\n\nAmém.",
        exercicio: "Reserve alguns minutos do seu dia para completar com sinceridade:\n\n“Senhor, hoje eu Te entrego __________________.”\n\nDepois de escrever, faça uma oração simples.\nNão tente resolver.\nApenas entregue.",
        fraseAncora: "O descanso verdadeiro começa quando o coração decide se aproximar de Cristo."
      },
      {
        dia: 2,
        titulo: "Em Busca de Águas Tranquilas",
        versiculo: "“O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.”",
        referencia: "Salmos 23:1–2",
        leitura: "Muitas vezes, a nossa alma se parece com uma terra seca.\nCorremos de um lado para o outro tentando saciar uma sede que nem sempre sabemos explicar.\n\nAcumulamos tarefas, informações e preocupações na esperança de que, ao final do dia, o cansaço vá embora.\nMas o que encontramos, muitas vezes, é apenas mais agitação.\n\nO Salmo 23 nos ensina algo precioso: ovelhas só conseguem descansar quando confiam plenamente naquele que as guia.\n\nÀs vezes, Deus cria pausas em nossa caminhada porque nós mesmos não sabemos a hora de parar.\nA alma precisa de alimento, não apenas de ocupação.\nPrecisa de refrigério, não de mais barulho.\n\nO Bom Pastor não empurra.\nEle guia mansamente.\nEle conduz até o lugar onde a ansiedade se cala e a paz flui como águas tranquilas.",
        aplicacao: "Hoje, observe:\nQuanto do seu dia é preenchido por barulho e quanto é reservado para silêncio?\n\nCrie uma pausa consciente para ouvir a voz do Pastor em vez do grito das urgências.",
        oracao: "Senhor, meu Pastor,\nreconheço que muitas vezes minha alma está agitada e meu coração inquieto.\n\nTenho buscado preencher meus dias com tarefas, barulho e preocupações, mas ainda assim me sinto vazio.\n\nGuia-me mansamente.\nLeva-me aos Teus verdes pastos.\nConduze-me às águas tranquilas onde a ansiedade se cala e a Tua paz me alcança.\n\nAquieta meus pensamentos, renova minhas forças e ensina-me a confiar que, sob o Teu cuidado, nada me faltará.\n\nAmém.",
        exercicio: "Encontre um lugar silencioso.\nDesligue o celular por alguns minutos.\nLeia o Salmo 23 em voz alta, devagar.\n\nDepois, respire fundo e diga:\n“Senhor, guia-me mansamente hoje.”",
        fraseAncora: "A pressa agita a alma, mas a confiança no Pastor traz descanso ao coração."
      },
      {
        dia: 3,
        titulo: "O Peso Que Você Não Precisa Carregar",
        versiculo: "“Lançando sobre Ele toda a vossa ansiedade, porque Ele tem cuidado de vós.”",
        referencia: "1 Pedro 5:7",
        leitura: "Muitas vezes, o cansaço da alma não vem apenas do que acontece fora, mas do peso que carregamos por dentro.\n\nHá preocupações que você assumiu como se fossem sua responsabilidade absoluta.\nMedos guardados em silêncio.\nE até culpas antigas ocupando espaço no coração.\n\nA Palavra não nos manda conviver com isso para sempre.\nEla diz: lance.\n\nLançar é um ato de confiança.\nEs reconhecer que há limites no nosso controle e descanso na soberania de Deus.\n\nDeus não se incomoda com o peso que você entrega.\nPelo contrário — Ele se importa.\n\nO cuidado do Senhor não é distante.\nEle se aproxima, acolhe e sustenta.\n\nHoje, o convite é soltar o que você tem segurado há tempo demais.\nVocê não foi criado para carregar o mundo nos ombros.\nVocê foi criado para confiar.",
        aplicacao: "Que peso você tem carregado como se fosse sua obrigação resolver sozinho?\nHoje, escolha entregar isso a Deus sem tentar controlar o resultado.",
        oracao: "Senhor Deus,\nreconheço que tenho carregado pesos que não fui chamado para sustentar.\nTenho tentado controlar situações, antecipar problemas e resolver com minhas próprias forças aquilo que pertence a Ti.\n\nHoje, eu eu lanço sobre Ti minhas ansiedades, meus medos e minhas preocupações.\nEnsina-me a confiar no Teu cuidado e a descansar na Tua fidelidade.\n\nSustenta a minha alma e alivia o meu coração.\n\nAmém.",
        exercicio: "Complete:\n“Hoje, eu escolho entregar a Deus: __________.”\n\nDepois, ore simples:\n“Senhor, eu confio isso a Ti.”",
        fraseAncora: "A alma encontra descanso quando para de carregar sozinha aquilo que Deus prometeu cuidar."
      },
      {
        dia: 4,
        titulo: "Quando a Mente Não Desacelera",
        versiculo: "“Não andeis ansiosos por coisa alguma… e a paz de Deus… guardará os vossos corações e os vossos pensamentos em Cristo Jesus.”",
        referencia: "Filipenses 4:6–7",
        leitura: "Há dias em que o corpo até para, mas a mente continua correndo.\nPensamentos se acumulam.\nCenários são criados.\nO amanhã é antecipado.\n\nPaulo escreveu sobre paz mesmo em meio à pressão.\nEle nos mostra um caminho: transformar preocupação em oração.\n\nOrar não é ignorar a realidade.\nEs decidir não enfrentá-la sozinho.\n\nQuando levamos tudo a Deus — o que entendemos e o que não entendemos — algo começa a mudar dentro de nós.\n\nA paz de Deus não é lógica.\nEla não depende de circunstâncias perfeitas.\nEla guarda o coração e protege os pensamentos.\n\nHoje, o convite não é brigar com a mente.\nEs entregar a mente.\nEs permitir que Cristo guarde o seu interior.",
        aplicacao: "Quais pensamentos te visitam quando tudo fica em silêncio?\nHoje, transforme cada preocupação em uma oração simples, uma por uma.",
        oracao: "Senhor Deus,\nminha mente tem estado inquieta.\nPensamentos se acumulam e roubam a minha paz.\n\nHoje eu escolho levar tudo a Ti.\nAquilo que consigo explicar e aquilo que nem sei como expressar.\n\nGuarda o meu coração e protege os meus pensamentos em Cristo Jesus.\nQue a Tua paz acalme o meu interior e traga descanso à minha alma.\n\nAmém.",
        exercicio: "Escreva 3 preocupações.\nPara cada uma, ore:\n“Senhor, eu Te entrego isso agora.”\n\nDepois, respire fundo por 30 segundos em silêncio.",
        fraseAncora: "A mente descansa quando a paz de Deus passa a guardá-la."
      },
      {
        dia: 5,
        titulo: "O Descanso Que Nasce da Confiança",
        versiculo: "“Confia no Senhor de todo o teu coração… e Ele endireitará as tuas veredas.”",
        referencia: "Provérbios 3:5–6",
        leitura: "Muitas vezes, o que mais nos cansa não é o problema em si, mas a tentativa de entender, controlar e antecipar tudo.\n\nQueremos garantias.\nRespostas rápidas.\nCertezas visíveis.\n\nA Palavra nos convida a um caminho diferente: confiar.\n\nConfiar não é fechar os olhos para a realidade.\nEs abrir mão da necessidade de dominar cada detalhe.\n\nHá caminhos que só Deus vê por inteiro.\nA confiança não elimina perguntas, mas sustenta o coração enquanto as respostas não chegam.\n\nDescansar em Deus é continuar caminhando mesmo sem compreender tudo, sabendo que Ele endireita as veredas no tempo certo.\n\nHoje, o convite é soltar a necessidade de controle e repousar na fidelidade do Senhor.",
        aplicacao: "Em que área você tem confiado mais no seu entendimento do que na direção de Deus?\nHoje, reconheça o Senhor nesse caminho e entregue suas expectativas a Ele.",
        oracao: "Senhor Deus,\nreconheço que muitas vezes tenho confiado mais na minha compreensão do que na Tua sabedoria.\nTenho tentado controlar caminhos que pertencem a Ti.\n\nHoje, eu escolho confiar.\nMesmo sem entender tudo.\nMesmo sem ver o fim.\n\nEntrega meu coração à Tua direção e ensina-me a descansar sabendo que Tu estás cuidando de cada detalhe.\n\nAmém.",
        exercicio: "Complete:\n“Senhor, hoje eu escolho confiar em Ti na área de __________.”\n\nAo longo do dia, sempre que tentar retomar o controle, repita:\n“Eu confio em Ti.”",
        fraseAncora: "O descanso começa quando a confiança substitui a necessidade de controle."
      },
      {
        dia: 6,
        titulo: "Entregar o Controle Também é Fé",
        versiculo: "“Entrega o teu caminho ao Senhor; confia n’Ele, e Ele tudo fará.”",
        referencia: "Salmos 37:5",
        leitura: "Existe um momento na caminhada espiritual em que percebemos: confiar em Deus não é apenas acreditar que Ele pode agir, mas permitir que Ele conduza.\n\nMuitas vezes, dizemos que confiamos, mas continuamos segurando as rédeas.\nOramos, mas queremos decidir o caminho.\n\nO controle oferece uma falsa segurança.\nMas a fé verdadeira começa quando soltamos aquilo que tentamos dominar.\n\nEntregar o caminho ao Senhor não significa ausência de responsabilidade.\nSignifica reconhecer que Deus enxerga o que nossos olhos não alcançam.\n\nEntrega é um ato contínuo.\nEs escolher, dia após dia, não retomar o controle do que já foi colocado nas mãos de Deus.\n\nHoje, o convite é abrir as mãos e permitir que Deus conduza o seu caminho.",
        aplicacao: "O que você tem tentado controlar por medo de perder, errar ou sofrer?\nHoje, entregue isso a Deus com sinceridade.",
        oracao: "Senhor Deus,\nreconheço que muitas vezes tenho tentado conduzir caminhos que pertencem a Ti.\nTenho segurado o controle por medo do que pode acontecer se eu soltar.\n\nHoje, eu escolho entregar meus planos, meus medos e meus expectativas.\nConfio que Tu és fiel e cuidarás do meu caminho melhor do que eu poderia fazer.\n\nEnsina-me a viver uma fé que descansa em Ti.\n\nAmém.",
        exercicio: "Complete:\n“Senhor, hoje eu entrego em Tuas mãos o controle de __________.”\n\nE repita durante o dia:\n“Eu confio em Ti.”",
        fraseAncora: "A fé amadurece quando aprendemos a descansar nas mãos de Deus."
      },
      {
        dia: 7,
        titulo: "Renovação Verdadeira da Alma",
        versiculo: "“Aquietai-vos e sabei que Eu sou Deus.”",
        referencia: "Salmos 46:10",
        leitura: "Ao longo destes dias, você foi convidado a parar, se aproximar, confiar e entregar.\n\nA renovação verdadeira da alma não acontece de forma brusca.\nEla nasce no silêncio.\nCresce na entrega.\nSe fortalece na confiança.\n\nDeus não apressa o processo do coração.\nEle trabalha com cuidado.\n\nAquietar-se não é fugir da realidade.\nEs reconhecer que Deus está presente mesmo quando tudo parece incerto.\n\nA renovação não vem da ausência de problemas.\nEla vem da presença constante do Senhor.\n\nTalvez sua vida ainda não esteja resolvida.\nMas, se sua alma encontrou descanso em Deus, ela já começou a ser renovada.\n\nHoje não é um fim.\nEs um recomeço.\nUm convite para continuar caminhando sem carregar tudo sozinho.",
        aplicacao: "Hoje, pratique o silêncio por alguns minutos.\nSem pedidos.\nSem pressa.\nApenas reconheça: Ele é Deus.",
        oracao: "Senhor Deus,\neu aquieto a minha alma diante de Ti.\nReconheço que Tu és Deus e que estás no controle de todas as coisas.\n\nObrigado porque, ao longo desta caminhada, Tu tens cuidado do meu coração.\nRenova a minha alma, fortalece a minha fé e ensina-me a continuar descansando em Ti nos dias que virão.\n\nQue a Tua presença seja o meu descanso constante.\n\nAmém.",
        exercicio: "Sente-se em um lugar tranquilo.\nRespire profundamente.\nRepita em silêncio:\n“Tu és Deus.”\n\nPermaneça até sentir o coração desacelerar.",
        fraseAncora: "A renovação da alma começa quando reconhecemos, em silêncio, que Deus está no controle."
      }
    ]
  },
  {
    id: 2,
    title: "Volume 2",
    subtitle: "Confiar Quando o Medo Fala Alto",
    isAvailable: false,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000",
    days: []
  },
  {
    id: 3,
    title: "Volume 3",
    subtitle: "Recomeçar Sem Culpa",
    isAvailable: false,
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000",
    days: []
  },
  {
    id: 4,
    title: "Volume 4",
    subtitle: "Esperar Também é Caminhar",
    isAvailable: false,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
    days: []
  }
];
