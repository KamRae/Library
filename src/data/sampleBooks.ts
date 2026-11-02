import { Book } from '../types';
import { splitIntoSentences, countWords, estimateReadingMinutes } from '../utils/textSplitter';

const QUIJOTE_PAGES = [
  `Capítulo I: Que trata de la condición y ejercicio del famoso hidalgo don Quijote de la Mancha.

En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.

El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera.

Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben; aunque, por conjeturas verosímiles, se deja entender que se llamaba Quijana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad.`,

  `Es, pues, de saber que este sobredicho hidalgo, los ratos que estaba ocioso —que eran los más del año—, se daba a leer libros de caballerías, con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de la caza, y aun la administración de su hacienda. Y llegó a tanto su curiosidad y desatino en esto, que vendió muchas hanegas de tierra de sembradura para comprar libros de caballerías en que leer, y así, llevó a su casa todos cuantos pudo haber dellos.

Y de todos, ningunos le parecían tan bien como los que compuso el famoso Feliciano de Silva; porque la claridad de su prosa y aquellas intrincadas razones suyas le parecían de perlas, y más cuando llegaba a leer aquellos requiebros y cartas de desafíos, donde en muchas partes hallaba escrito: «La razón de la sinrazón que a mi razón se hace, de tal manera mi razón enflaquece, que con razón me quejo de la vuestra fermosura».

Con estas razones perdía el pobre caballero el juicio, y desvelábase por entenderlas y desentrañarles el sentido, que no se lo sacara ni las entendiera el mesmo Aristóteles, si resucitara para sólo ello. En resolución, él se enfrascó tanto en su letura, que se le pasaban las noches leyendo de claro en claro, y los días de turbio en turbio; y así, del poco dormir y del mucho leer, se le secó el celebro de manera que vino a perder el juicio.`,

  `Rematado ya su juicio, vino a dar en el más extraño pensamiento que jamás dio loco en el mundo; y fue que le pareció convenible y necesario, así para el aumento de su honra como para el servicio de su república, hacerse caballero andante, y irse por todo el mundo con sus armas y caballo a buscar las aventuras y a ejercitarse en todo aquello que él había leído que los caballeros andantes se ejercitaban, deshaciendo todo género de agravio, y poniéndose en ocasiones y peligros donde, acabándolos, cobrase eterno nombre y fama.

Imaginábase el pobre ya coronado por el valor de su brazo, por lo menos, del imperio de Trapisonda; y así, con estos tan agradables pensamientos, llevado del estraño gusto que en ellos sentía, se dio priesa a poner en efecto lo que deseaba. Y lo primero que hizo fue limpiar unas armas que habían sido de sus bisabuelos, que, tomadas de orín y llenas de moho, luengos siglos había que estaban puestas y olvidadas en un rincón.

Fue luego a ver su rocín, y aunque tenía más cuartos que un real y más tachas que el caballo de Gonela, le pareció que ni el Bucéfalo de Alejandro ni Babieca el del Cid con él se igualaban. Cuatro días se le pasaron en imaginar qué nombre le pondría; y al fin vino a llamarle Rocinante, nombre, a su parecer, alto, sonoro y significativo de lo que había sido cuando fue rocín, antes de lo que ahora era, que era antes y primero de todos los rocines del mundo.`
];

const PRINCIPITO_PAGES = [
  `Capítulo XXI: El zorro y el secreto más hermoso de la vida.

Fue entonces cuando apareció el zorro.
—Buenos días —dijo el zorro con voz amable.
—Buenos días —respondió cortésmente el principito, que se volvió pero no vio nada.
—Estoy aquí —dijo la voz—, bajo el manzano.
—¿Quién eres tú? —preguntó el principito—. Eres muy bonito.
—Soy un zorro —dijo el animal.
—Ven a jugar conmigo —le propuso el principito—. Estoy tan triste...
—No puedo jugar contigo —dijo el zorro—. No estoy domesticado.
—¡Ah! Perdón —dijo el principito.

Pero, después de reflexionar, añadió:
—¿Qué significa «domesticar»?
—Es una cosa demasiado olvidada —dijo el zorro—. Significa «crear lazos».
—¿Crear lazos?
—Así es —dijo el zorro—. Todavía no eres para mí más que un niño parecido a cien mil niños. Y no te necesito. Y tú tampoco me necesitas. No soy para ti más que un zorro parecido a cien mil zorros. Pero si me domésticas, tendremos necesidad el uno del otro. Tú serás para mí único en el mundo. Yo seré para ti único en el mundo...`,

  `—Empiezo a comprender —dijo el principito—. Hay una flor... creo que me ha domesticado.
—Es posible —dijo el zorro—. En la Tierra se ve todo tipo de cosas.
—¡Oh, no es en la Tierra! —dijo el principito.
El zorro pareció intrigado:
—¿En otro planeta?
—Sí.
—¿Hay cazadores en ese planeta?
—No.
—¡Eso es interesante! ¿Y gallinas?
—No.
—No hay nada perfecto —suspiró el zorro.

Pero el zorro volvió a su idea:
—Mi vida es monótona. Cazo gallinas, los hombres me cazan. Todas las gallinas se parecen y todos los hombres se parecen. Por lo tanto, me aburro un poco. Pero si me domésticas, mi vida se llenará de sol. Conoceré un ruido de pasos que será diferente de todos los otros. Los otros pasos me hacen esconder bajo la tierra. El tuyo me llamará fuera de la madriguera, como una música. Y además, ¡mira! ¿Ves, allá a lo lejos, los campos de trigo? Yo no como pan. El trigo para mí es inútil. Los campos de trigo no me recuerdan nada. ¡Y eso es triste! Pero tú tienes cabellos de color de oro. ¡Cuando me hayas domesticado, será maravilloso! El trigo, que es dorado, me hará recordar a ti. Y me gustará el ruido del viento en el trigo...`,

  `El zorro calló y miró largo tiempo al principito.
—Por favor... ¡domestícame! —dijo.
—Me gustaría mucho —respondió el principito—, pero no tengo mucho tiempo. Tengo que encontrar amigos y conocer muchas cosas.
—Sólo se conocen las cosas que se domestican —dijo el zorro—. Los hombres ya no tienen tiempo de conocer nada. Compran cosas ya hechas a los comerciantes. Pero como no existen comerciantes de amigos, los hombres ya no tienen amigos. Si quieres un amigo, ¡domestícame!

Así el principito domesticó al zorro. Y cuando se acercó la hora de la partida:
—¡Ah! —dijo el zorro—. Voy a llorar.
—Tuya es la culpa —dijo el principito—; yo no quería hacerte daño, pero tú quisiste que te domesticara.
—Es verdad —dijo el zorro.
—¡Pero vas a llorar! —dijo el principito.
—Sí, ciertamente —dijo el zorro.
—Entonces no ganas nada.
—Gano —dijo el zorro—, por el color del trigo.

Luego añadió:
—Ve a ver las rosas otra vez. Comprenderás que la tuya es única en el mundo. Volverás para decirme adiós, y te regalaré un secreto.

Y cuando volvió junto al zorro, éste le dijo:
—Adiós. He aquí mi secreto. Es muy simple: no se ve bien sino con el corazón. Lo esencial es invisible para los ojos.`
];

const MACONDO_PAGES = [
  `Capítulo I: La fundación en el tiempo y el prodigio del hielo.

Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas que se precipitaban por un lecho de piedras pulidas, blancas y enormes como huevos prehistóricos. El mundo era tan reciente, que muchas cosas carecían de nombre, y para mencionarlas había que señalarlas con el dedo.

Todos los años, por el mes de marzo, una familia de gitanos desarrapados plantaba su carpa cerca de la aldea, y con un grande alboroto de pitos y timbales daban a conocer los nuevos inventos. Primero llevaron el imán. Un gitano corpulento, de barba montaraz y manos de gorrión, que se presentó con el nombre de Melquíades, hizo una truculenta demostración pública de lo que él mismo llamaba la octava maravilla de los sabios alquimistas de Macedonia.

Fue de casa en casa arrastrando dos lingotes metálicos, y todo el mundo se espantó al ver que los calderos, las pailas, las tenazas y los anafes se caían de su sitio, y las maderas crujían por la desesperación de los clavos y los tornillos tratando de desenclavarse, y aun los objetos perdidos desde hacía mucho tiempo aparecían por donde más se les había buscado, y se arrastraban en desbandada turbulenta detrás de los fierros mágicos de Melquíades. «Las cosas tienen vida propia —pregonaba el gitano con áspero acento—, todo es cuestión de despertarles el ánima».`,

  `José Arcadio Buendía, cuya desaforada imaginación iba siempre más lejos que el ingenio de la naturaleza, y aun más allá del milagro y la magia, pensó que era posible servirse de aquella invención inútil para desentrañar el oro de la tierra. Melquíades, que era un hombre honrado, le previno: «Para eso no sirve». Pero José Arcadio Buendía no creía en aquel tiempo en la honradez de los gitanos, así que cambió su mulo y una partida de chivos por los dos lingotes imantados. Úrsula Iguarán, su mujer, que contaba con aquellos animales para ensanchar el desmedrado patrimonio doméstico, no pudo disuadirlo.

Durante varios meses se empeñó José Arcadio Buendía en demostrar el acierto de sus conjeturas. Exploró palmo a palmo la región, arrastrando los dos lingotes de hierro y recitando en voz alta el conjuro de Melquíades. Lo único que logró desenterrar fue una armadura del siglo quince con todas sus partes soldadas por un cascote de óxido, cuyo interior producía una resonancia hueca de calabazo lleno de pedruscos. Cuando José Arcadio Buendía y los cuatro hombres de su expedición lograron desarticular la armadura, encontraron dentro un esqueleto calcificado que llevaba colgado en el cuello un relicario de cobre con un rizo de mujer.`
];

function buildBook(
  id: string,
  title: string,
  author: string,
  coverUrl: string,
  description: string,
  rawPages: string[],
  language: string = 'es'
): Book {
  const pages = rawPages.map((rawText, idx) => ({
    pageNumber: idx + 1,
    text: rawText,
    sentences: splitIntoSentences(rawText),
  }));

  const totalWords = rawPages.reduce((acc, p) => acc + countWords(p), 0);

  return {
    id,
    title,
    author,
    coverUrl,
    description,
    pages,
    totalPages: pages.length,
    totalWords,
    estimatedMinutes: estimateReadingMinutes(totalWords),
    language,
    source: 'sample',
    addedAt: '2026-11-01',
  };
}

export const SAMPLE_BOOKS: Book[] = [
  buildBook(
    'quijote-cervantes',
    'Don Quijote de la Mancha',
    'Miguel de Cervantes Saavedra',
    '/src/assets/images/book_quijote_cover_1793594109459.jpg',
    'La obra cumbre de la literatura en español. Vive las aventuras del ingenioso hidalgo en su búsqueda de la justicia y la gloria.',
    QUIJOTE_PAGES,
    'es'
  ),
  buildBook(
    'principito-exupery',
    'El Principito',
    'Antoine de Saint-Exupéry',
    '/src/assets/images/book_principito_cover_1793594125980.jpg',
    'Una fábula poética sobre el amor, la amistad y el misterio de los lazos invisibles que unen a los seres.',
    PRINCIPITO_PAGES,
    'es'
  ),
  buildBook(
    'macondo-marquez',
    'El Corazón de Macondo',
    'Gabriel García Márquez',
    '/src/assets/images/book_macondo_cover_1793594141461.jpg',
    'El esplendor del realismo mágico: la fundación de Macondo, los inventos de los gitanos y el memorable descubrimiento del hielo.',
    MACONDO_PAGES,
    'es'
  ),
];
