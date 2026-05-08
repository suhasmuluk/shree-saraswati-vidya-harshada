import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { Lightbulb, Palette, Music, Calculator, BookOpen, Dumbbell, Brain, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Activity = {
  title: string;
  titleMr: string;
  description: string;
  descriptionMr: string;
  category: string;
  duration: string;
  materials?: string;
};

const activitiesByClass: Record<string, Activity[]> = {
  'Playgroup': [
    { title: 'Color Sorting', titleMr: 'रंग ओळख', description: 'Give children colored blocks or balls and ask them to sort by color into matching bowls.', descriptionMr: 'मुलांना रंगीत ब्लॉक्स किंवा बॉल द्या आणि त्यांना रंगानुसार बाउलमध्ये वेगळे करायला सांगा.', category: 'cognitive', duration: '10 min', materials: 'Colored blocks, bowls' },
    { title: 'Free Drawing', titleMr: 'मुक्त चित्रकला', description: 'Let children scribble freely with crayons on large paper. Encourage color naming.', descriptionMr: 'मुलांना मोठ्या कागदावर क्रेयॉनने मुक्तपणे चित्र काढू द्या. रंगांची नावे सांगण्यास प्रोत्साहित करा.', category: 'art', duration: '15 min', materials: 'Crayons, large paper sheets' },
    { title: 'Action Songs', titleMr: 'कृती गाणी', description: 'Sing "Head Shoulders Knees and Toes" or "If You\'re Happy" with actions to develop body awareness.', descriptionMr: '"डोके खांदे गुडघे पाय" गाणे कृतीसह गा. शरीराच्या अवयवांची ओळख होते.', category: 'music', duration: '10 min' },
    { title: 'Playdough Fun', titleMr: 'मातीचा खेळ', description: 'Children squeeze, roll, and shape playdough to strengthen hand muscles.', descriptionMr: 'मुले प्लेडो दाबतात, गोल करतात आणि आकार देतात. हातांचे स्नायू मजबूत होतात.', category: 'motor', duration: '15 min', materials: 'Playdough' },
    { title: 'Story Time with Pictures', titleMr: 'चित्र कथा वेळ', description: 'Show big picture books and narrate simple stories. Ask "What do you see?" questions.', descriptionMr: 'मोठी चित्र पुस्तके दाखवा आणि साध्या कथा सांगा. "तुला काय दिसतंय?" असे प्रश्न विचारा.', category: 'language', duration: '10 min', materials: 'Picture books' },
    { title: 'Ball Rolling', titleMr: 'बॉल खेळ', description: 'Sit in a circle and roll a ball to each other. Say child\'s name while passing.', descriptionMr: 'वर्तुळात बसा आणि एकमेकांना बॉल गोल करा. बॉल देताना मुलाचे नाव घ्या.', category: 'physical', duration: '10 min', materials: 'Soft ball' },
    { title: 'Tearing & Pasting', titleMr: 'फाडणे आणि चिकटवणे', description: 'Tear colored paper into pieces and paste them inside a drawn shape (apple, star).', descriptionMr: 'रंगीत कागद तुकडे करून काढलेल्या आकारात (सफरचंद, तारा) चिकटवा.', category: 'art', duration: '15 min', materials: 'Colored paper, glue, printed shapes' },
    { title: 'Sand Play', titleMr: 'वाळूचा खेळ', description: 'Let children play with sand using cups and spoons. Great for sensory development.', descriptionMr: 'मुलांना कप आणि चमच्यांसह वाळूत खेळू द्या. संवेदी विकासासाठी उत्तम.', category: 'motor', duration: '15 min', materials: 'Sand tray, cups, spoons' },
  ],
  'Nursery': [
    { title: 'Shape Hunt', titleMr: 'आकार शोध', description: 'Hide shape cutouts around the room. Children find them and name each shape.', descriptionMr: 'खोलीत आकाराचे कटआउट लपवा. मुले ते शोधतात आणि प्रत्येक आकाराचे नाव सांगतात.', category: 'cognitive', duration: '15 min', materials: 'Shape cutouts' },
    { title: 'Finger Painting', titleMr: 'बोट चित्रकला', description: 'Use finger paints to create patterns like trees, flowers, or rainbows on paper.', descriptionMr: 'कागदावर झाडे, फुले किंवा इंद्रधनुष्य यांचे नमुने बनवण्यासाठी बोट पेंट वापरा.', category: 'art', duration: '20 min', materials: 'Finger paints, paper, aprons' },
    { title: 'Counting with Objects', titleMr: 'वस्तूंसह मोजणी', description: 'Count 1-10 using real objects like pencils, blocks, or beads.', descriptionMr: 'पेन्सिल, ब्लॉक्स किंवा मणी यांसारख्या वस्तूंनी 1-10 मोजणी करा.', category: 'math', duration: '10 min', materials: 'Beads, blocks' },
    { title: 'Animal Sounds Game', titleMr: 'प्राण्यांचे आवाज खेळ', description: 'Teacher makes animal sound, children guess which animal. Then show flashcard.', descriptionMr: 'शिक्षक प्राण्यांचा आवाज काढतात, मुले कोणता प्राणी ते ओळखतात. मग फ्लॅशकार्ड दाखवा.', category: 'language', duration: '10 min', materials: 'Animal flashcards' },
    { title: 'Threading Beads', titleMr: 'मणी ओवणे', description: 'Thread large beads on a string in a given color pattern.', descriptionMr: 'दिलेल्या रंग पॅटर्ननुसार दोऱ्यावर मोठे मणी ओवा.', category: 'motor', duration: '15 min', materials: 'Large beads, string' },
    { title: 'Rhyme Time', titleMr: 'यमक वेळ', description: 'Teach rhymes like "Twinkle Twinkle", "Jack and Jill" with hand actions.', descriptionMr: '"चंदा मामा दूर के", "मछली जल की रानी है" हातांच्या कृतीसह शिकवा.', category: 'music', duration: '10 min' },
    { title: 'Obstacle Course', titleMr: 'अडथळा शर्यत', description: 'Simple course: crawl under table, jump over rope, walk on line. Builds coordination.', descriptionMr: 'सोपा कोर्स: टेबलाखालून रांगणे, दोरीवरून उडी, रेषेवर चालणे. समन्वय तयार होतो.', category: 'physical', duration: '15 min', materials: 'Rope, cones, table' },
    { title: 'Paper Folding (Simple)', titleMr: 'कागद दुमडणे (सोपे)', description: 'Fold paper to make a fan or a simple hat. Develops following instructions.', descriptionMr: 'पंखा किंवा साधी टोपी बनवण्यासाठी कागद दुमडा. सूचना पाळण्याची सवय लागते.', category: 'art', duration: '10 min', materials: 'Paper' },
  ],
  'Junior KG': [
    { title: 'Letter Tracing', titleMr: 'अक्षर लिखाण', description: 'Trace uppercase letters A-Z on dotted worksheets. Focus on pencil grip.', descriptionMr: 'ठिपक्यांवरील वर्कशीटवर A-Z मोठी अक्षरे लिहा. पेन्सिल पकड्यावर लक्ष द्या.', category: 'language', duration: '15 min', materials: 'Tracing worksheets, pencils' },
    { title: 'Number Matching (1-20)', titleMr: 'संख्या जुळवणी (1-20)', description: 'Match number cards with the correct number of objects on picture cards.', descriptionMr: 'संख्या कार्ड्स चित्र कार्ड्सवरील योग्य वस्तूंच्या संख्येशी जुळवा.', category: 'math', duration: '15 min', materials: 'Number cards, picture cards' },
    { title: 'Craft: Paper Plate Animals', titleMr: 'हस्तकला: पेपर प्लेट प्राणी', description: 'Use paper plates, colors, and craft supplies to make animal faces (lion, cat, rabbit).', descriptionMr: 'प्राण्यांचे चेहरे (सिंह, मांजर, ससा) बनवण्यासाठी पेपर प्लेट्स, रंग आणि हस्तकला साहित्य वापरा.', category: 'art', duration: '25 min', materials: 'Paper plates, colors, googly eyes, glue' },
    { title: 'Simon Says', titleMr: 'सायमन सेज', description: 'Play "Simon Says" to practice body parts, directions, and listening skills.', descriptionMr: '"सायमन सेज" खेळ खेळा - शरीराचे अवयव, दिशा आणि ऐकण्याचे कौशल्य शिका.', category: 'physical', duration: '10 min' },
    { title: 'Sight Word Bingo', titleMr: 'शब्द बिंगो', description: 'Create bingo cards with simple words (cat, dog, sun). Teacher calls words, children mark.', descriptionMr: 'साध्या शब्दांचे बिंगो कार्ड बनवा (cat, dog, sun). शिक्षक शब्द बोलतात, मुले खुणा करतात.', category: 'language', duration: '15 min', materials: 'Bingo cards, markers' },
    { title: 'Pattern Making', titleMr: 'नमुना बनवणे', description: 'Create ABAB, AABB patterns using colored blocks or stickers.', descriptionMr: 'रंगीत ब्लॉक्स किंवा स्टिकर्स वापरून ABAB, AABB नमुने तयार करा.', category: 'math', duration: '10 min', materials: 'Colored blocks, stickers' },
    { title: 'Show & Tell', titleMr: 'दाखवा आणि सांगा', description: 'Each child brings a favorite toy and speaks 2-3 sentences about it. Builds confidence.', descriptionMr: 'प्रत्येक मूल आवडते खेळणे आणते आणि 2-3 वाक्ये बोलते. आत्मविश्वास वाढतो.', category: 'language', duration: '20 min' },
    { title: 'Frog Jumps', titleMr: 'बेडूक उड्या', description: 'Place number cards on floor. Teacher says a number, child jumps to it. Math + exercise!', descriptionMr: 'जमिनीवर संख्या कार्ड ठेवा. शिक्षक संख्या बोलतात, मूल तिथे उडी मारतो. गणित + व्यायाम!', category: 'physical', duration: '10 min', materials: 'Number cards' },
  ],
  'Senior KG': [
    { title: 'Simple Addition with Objects', titleMr: 'वस्तूंसह साधी बेरीज', description: 'Use toys or counters to solve 2+3=?, 4+1=? type problems visually.', descriptionMr: 'खेळणी किंवा काउंटर वापरून 2+3=?, 4+1=? प्रकारचे प्रश्न दृष्यदृष्ट्या सोडवा.', category: 'math', duration: '15 min', materials: 'Counters, toys' },
    { title: 'Story Writing (Pictures)', titleMr: 'कथा लेखन (चित्रे)', description: 'Show 3-4 sequence pictures. Children narrate the story and try to write a sentence.', descriptionMr: '3-4 क्रम चित्रे दाखवा. मुले कथा सांगतात आणि एक वाक्य लिहण्याचा प्रयत्न करतात.', category: 'language', duration: '20 min', materials: 'Sequence picture cards' },
    { title: 'Science: Sink or Float', titleMr: 'विज्ञान: बुडतो की तरंगतो', description: 'Put objects in water and predict if they sink or float. Record results on chart.', descriptionMr: 'वस्तू पाण्यात ठेवा आणि ते बुडते की तरंगते अंदाज लावा. तक्त्यावर निकाल लिहा.', category: 'cognitive', duration: '20 min', materials: 'Water tub, various objects, chart' },
    { title: 'Calendar Activity', titleMr: 'दिनदर्शिका उपक्रम', description: 'Daily: identify today\'s day, date, month, weather. Children take turns being the "calendar helper."', descriptionMr: 'दररोज: आजचा वार, तारीख, महिना, हवामान ओळखा. मुले आळीपाळीने "दिनदर्शिका सहाय्यक" बनतात.', category: 'cognitive', duration: '10 min', materials: 'Classroom calendar' },
    { title: 'Spelling Bee (Simple Words)', titleMr: 'शब्द स्पर्धा (सोपे शब्द)', description: 'Spell CVC words (cat, bat, pen, dog) out loud. Give stars for correct answers.', descriptionMr: 'CVC शब्द (cat, bat, pen, dog) मोठ्याने स्पेल करा. बरोबर उत्तरांसाठी तारे द्या.', category: 'language', duration: '15 min', materials: 'Word flashcards, star stickers' },
    { title: 'Craft: Origami Animals', titleMr: 'हस्तकला: ओरिगामी प्राणी', description: 'Make simple origami like a dog face, boat, or cup. Step-by-step demonstration.', descriptionMr: 'कुत्र्याचा चेहरा, होडी किंवा कप यांसारखी सोपी ओरिगामी बनवा. चरणबद्ध प्रात्यक्षिक.', category: 'art', duration: '20 min', materials: 'Origami paper' },
    { title: 'Relay Race with Tasks', titleMr: 'कार्यांसह शर्यत', description: 'Teams race but must complete a task at each station (write name, count to 20, tie shoe).', descriptionMr: 'संघ शर्यत करतात पण प्रत्येक स्टेशनवर कार्य पूर्ण करावे लागते (नाव लिहा, 20 पर्यंत मोजा).', category: 'physical', duration: '20 min' },
    { title: 'Money Recognition', titleMr: 'नाणी ओळख', description: 'Show Indian coins (₹1, ₹2, ₹5, ₹10) and practice identifying and adding them.', descriptionMr: 'भारतीय नाणी (₹1, ₹2, ₹5, ₹10) दाखवा आणि ओळखणे व बेरीज करण्याचा सराव करा.', category: 'math', duration: '15 min', materials: 'Coins (real or toy)' },
  ],
};

const categoryConfig: Record<string, { icon: any; label: string; labelMr: string; color: string }> = {
  cognitive: { icon: Brain, label: 'Cognitive', labelMr: 'बौद्धिक', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  art: { icon: Palette, label: 'Art & Craft', labelMr: 'कला', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  music: { icon: Music, label: 'Music & Rhymes', labelMr: 'संगीत', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  math: { icon: Calculator, label: 'Math', labelMr: 'गणित', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  language: { icon: BookOpen, label: 'Language', labelMr: 'भाषा', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  motor: { icon: Dumbbell, label: 'Motor Skills', labelMr: 'कौशल्य', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  physical: { icon: Dumbbell, label: 'Physical', labelMr: 'शारीरिक', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

const ActivityIdeas = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isMr = language === 'mr';

  const classNames = Object.keys(activitiesByClass);

  const copyToHomework = (activity: Activity) => {
    const text = isMr
      ? `${activity.titleMr}\n${activity.descriptionMr}`
      : `${activity.title}\n${activity.description}`;
    navigator.clipboard.writeText(text);
    setCopiedId(activity.title);
    toast({ title: isMr ? 'कॉपी केले! गृहपाठात पेस्ट करा' : 'Copied! Paste it in Homework' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isMr ? 'उपक्रम आणि खेळ कल्पना' : 'Activity & Game Ideas'}
        </h1>
        <p className="text-muted-foreground">
          {isMr ? 'वर्गनिहाय शिक्षकांसाठी तयार उपक्रम — कॉपी करा आणि गृहपाठात वापरा' : 'Ready-made activities for teachers by class — copy and use in Homework'}
        </p>
      </div>

      <Tabs defaultValue={classNames[0]} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          {classNames.map((cls) => (
            <TabsTrigger key={cls} value={cls} className="flex-1 min-w-[100px]">
              {cls}
            </TabsTrigger>
          ))}
        </TabsList>

        {classNames.map((cls) => (
          <TabsContent key={cls} value={cls} className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {activitiesByClass[cls].map((activity) => {
                const cat = categoryConfig[activity.category];
                const CatIcon = cat?.icon || Lightbulb;
                const isCopied = copiedId === activity.title;

                return (
                  <Card key={activity.title} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${cat?.color || ''}`}>
                            <CatIcon className="h-3 w-3 mr-1" />
                            {isMr ? cat?.labelMr : cat?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">⏱ {activity.duration}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => copyToHomework(activity)}
                          title={isMr ? 'कॉपी करा' : 'Copy to clipboard'}
                        >
                          {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {isMr ? activity.titleMr : activity.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isMr ? activity.descriptionMr : activity.description}
                      </p>
                      {activity.materials && (
                        <p className="text-xs text-muted-foreground/70">
                          📦 {isMr ? 'साहित्य' : 'Materials'}: {activity.materials}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ActivityIdeas;
