/* Discovery-first science stories.
   These are teaching contexts, not assessment answers or claims that one person "invented" a field.
   Each story asks what was observed, what competing idea existed, and what evidence changed the model. */
(function(root){
'use strict';
const stories={};
function add(id,mystery,predictions,history,evidence,model,source){stories[id]={id,mystery,predictions,history,evidence,model,source};}

add('evidence',
 'In 1854, many people in one London neighbourhood became sick with cholera. How could anyone tell whether the cause was bad air, contaminated water, or something else?',
 ['Look for a pattern in where sick people lived and what water they used.','Choose the explanation most doctors already believed.','One dramatic case is enough to prove the cause.'],
 ['John Snow recorded where cholera deaths occurred and compared them with local water sources. A strong cluster appeared near the Broad Street pump.','The map was evidence consistent with contaminated water, but the map by itself was not magic proof. Snow also compared water supplies and investigated exceptions. The important move was separating observations from explanations and looking for evidence that could distinguish them.'],
 {prompt:'Which observation would most strongly challenge the water-source explanation?',choices:['Many people who never used the suspected water became ill at the same high rate.','The pump handle was made of metal.','Some nearby houses were taller than others.'],correct:0,explain:'A useful test asks what should differ if the explanation is right. If exposure to the suspected water made no difference, the explanation would need revision.'},
 'Science becomes stronger when a claim makes a prediction that could turn out to be wrong. Record the observation first; then ask which explanation best survives the evidence.',
 {name:'John Snow cholera evidence — historical epidemiology review',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4521606/'});

add('fairtest',
 'Sailors with scurvy were being given many different remedies. How could a ship surgeon compare treatments fairly instead of trusting reputation?',
 ['Give similar patients different treatments while keeping important conditions as similar as possible.','Give the newest treatment to the sickest sailors and compare afterward.','Ask which remedy has the most famous supporter.'],
 ['In 1747, James Lind described comparing six treatments among twelve sailors with similar scurvy symptoms who shared the same basic diet and living conditions. Citrus performed much better than the other treatments in his report.','The experiment was small and not a modern randomized trial, and historians debate parts of the familiar story. Its lasting lesson is methodological: useful comparisons try to hold other important conditions alike so one difference can be interpreted.'],
 {prompt:'Why was giving the sailors the same basic diet useful?',choices:['It reduced another possible explanation for differences in recovery.','It guaranteed every sailor would recover.','It made the citrus taste stronger.'],correct:0,explain:'Keeping a relevant condition similar makes it harder to explain the result by that condition instead of the treatment being compared.'},
 'A fair test does not mean every detail is identical. It means the comparison is designed so the factor you care about is not tangled with another obvious change.',
 {name:'James Lind and comparative treatment evidence — NIH historical review',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC1276007/'});

add('measurement',
 'Suppose a metal seems to gain mass when it burns. Is matter being created, or did something from the air join it?',
 ['Weigh the whole system carefully, including gases when possible.','Judge by how bright the flame looks.','Use more decimal places without checking the balance.'],
 ['Antoine Lavoisier made unusually careful mass measurements in chemical experiments, including gases and closed systems. These measurements helped replace older explanations of burning.','The key was not that Lavoisier owned a balance; it was that he designed experiments around quantities that different explanations predicted differently. Precision only helps when the measurement answers the question.'],
 {prompt:'A balance reads 2 g when empty. What should happen before trusting a reaction mass?',choices:['Check or correct the zero error.','Repeat the same biased reading many times and average it.','Round the result to more decimal places.'],correct:0,explain:'Repeated measurements can reduce random scatter, but a consistent zero offset needs calibration or correction.'},
 'Measurement is a scientific argument: choose a quantity, unit, instrument and comparison that can actually discriminate between explanations.',
 {name:'Lavoisier and quantitative chemistry — Science History Institute',url:'https://www.sciencehistory.org/education/scientific-biographies/antoine-laurent-lavoisier/'});

add('graphs',
 'A table contains hundreds of illness locations. How can a pattern hidden in the rows become visible?',
 ['Arrange or plot the data so location or another variable can be compared.','Read only the first few rows.','Make the tallest bar represent the explanation you prefer.'],
 ['Maps and graphs became powerful because they let investigators inspect relationships that are difficult to see in a long list. John Snow’s cholera map is a famous example: locations of deaths could be compared with water pumps.','A display does not create evidence that was not measured. It can reveal a pattern, an outlier or a missing denominator — and it can also mislead when axes or scales are chosen poorly.'],
 {prompt:'A graph rises over the measured range. Which statement is safest?',choices:['The measured values increased over that range.','The values must keep rising forever.','The graph proves what caused the increase.'],correct:0,explain:'A graph first describes recorded data. Extrapolation and causal claims require additional evidence.'},
 'Read axes, units and the measured range before interpreting shape. A graph is a tool for seeing evidence, not a shortcut to causation.',
 {name:'John Snow map as spatial evidence — epidemiology review',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4521606/'});

add('normalise',
 'Hospital A reports 30 infections and Hospital B reports 20. Which is safer?',
 ['First compare the numbers of patients or opportunities for infection.','Hospital B, because 20 is always less than 30.','Hospital A, because larger hospitals are always safer.'],
 ['As public-health datasets grew, investigators learned that raw totals could give the wrong comparison. A place with more people may have more cases even when each person’s risk is lower. Rates put observations over a common denominator.','This same idea appears all over science: bubbles per minute, energy per gram, water loss per leaf area, or cases per population. The denominator must match the question.'],
 {prompt:'One plant loses 12 mL in 2 hours and another loses 9 mL in 1 hour. Which has the larger average loss rate?',choices:['The second plant.','The first plant.','They are equal because 12 and 9 are close.'],correct:0,explain:'12/2 = 6 mL/h while 9/1 = 9 mL/h. Equal units make the comparison meaningful.'},
 'Normalising is not automatically “more scientific.” Choose the denominator that represents the constraint or mechanism you are actually comparing.',
 null);

add('models',
 'A tiny particle passes through thin metal. Most go straight, but a few bounce through surprisingly large angles. What kind of atom could produce that pattern?',
 ['An atom with most positive mass concentrated in a tiny region.','A completely uniform blob with no concentrated region.','Any model works because models cannot be tested.'],
 ['In Rutherford’s laboratory, scattering experiments directed alpha particles at thin metal foil. Most passed through with little deflection, while a small fraction were strongly deflected.','That pattern was difficult to reconcile with a diffuse positive-charge model. A model was replaced not because a newer picture looked nicer, but because it made better sense of a surprising observation.'],
 {prompt:'What makes one scientific model more useful than another?',choices:['It correctly predicts observations that distinguish the competing models.','It has the most detailed drawing.','It was proposed more recently.'],correct:0,explain:'A model earns confidence by surviving tests, especially tests where competing models predict different outcomes.'},
 'Treat a model as a tool with assumptions and limits. Ask what it predicts, what it leaves out, and which observation could force it to change.',
 null);

add('circuits',
 'A frog muscle twitches when metals touch it. Is the electricity coming from the animal, from the metals, or from something else?',
 ['Design a source that works without the animal and see whether current can still be produced.','Choose whichever explanation sounds more natural.','Repeat the frog observation without changing anything.'],
 ['Luigi Galvani’s frog experiments raised questions about “animal electricity.” Alessandro Volta argued that the metal contacts mattered and built the voltaic pile from alternating metals and electrolyte. The pile produced a sustained electrical effect without frog tissue.','Galvani and Volta were each seeing part of a larger story: living tissues use electrical signals, and chemical cells can drive current in an external circuit. A continuous source made systematic circuit experiments possible.'],
 {prompt:'If one branch of a parallel circuit is opened while another branch still connects both battery terminals, what observation tests the “current leaks out of the gap” idea?',choices:['The intact branch can still carry current and its bulb can remain lit.','The open gap becomes brighter.','Both battery terminals disappear.'],correct:0,explain:'An open gap is not a drain. Trace whether a complete conducting route still exists through the intact branch.'},
 'Current requires a complete conducting path. Bulbs transfer electrical energy; current is not fuel that leaks away or gets used up by the first component.',
 {name:'Galvani, Volta and the voltaic pile — Science History Institute',url:'https://www.sciencehistory.org/stories/magazine/when-electricity-met-democratic-revolution/'});

add('light',
 'Do we see because the eye sends something outward, or because light travels into the eye?',
 ['Test how light, objects, shadows and small openings behave.','Assume sight must come from the eye because looking feels active.','Close one eye and decide from intuition alone.'],
 ['Around a thousand years ago, Ibn al-Haytham studied light with geometry, observation and experiments. His Book of Optics challenged older ideas about vision and analysed how light travels and enters the eye.','Camera-obscura-like observations, shadows and reflection could be explained by light travelling along paths from sources and objects toward the observer. The theory was judged by what the light actually did.'],
 {prompt:'You see a book under a lamp. Which path is essential?',choices:['Lamp → book → eye.','Eye → book → lamp.','Book → lamp → eye without reflected light.'],correct:0,explain:'The lamp supplies light; the book reflects some of it; that reflected light enters the eye.'},
 'Follow the physical path of light. A useful ray diagram is a model of directions and interactions, not a picture of something leaving the eye.',
 {name:'Ibn al-Haytham and experimental optics — UNESCO',url:'https://courier.unesco.org/en/articles/ibn-al-haythams-scientific-method'});

add('heat',
 'Metal drilling can become hot again and again. If heat were a stored fluid inside the metal, where would the seemingly endless heat come from?',
 ['Mechanical work can be transformed into thermal energy.','The metal contains an unlimited supply of a heat substance.','Temperature and heat must mean the same thing.'],
 ['Count Rumford noticed large amounts of heat during cannon boring and argued that motion and friction mattered. Later, James Joule quantitatively connected mechanical work with heating.','These experiments helped replace the idea of heat as a conserved material fluid with the modern idea of energy transfer. The historical change took many experiments and scientists, not one instant discovery.'],
 {prompt:'Two objects start at different temperatures and touch. What happens overall?',choices:['Energy transfers from the hotter object toward the cooler one.','Cold flows into the hotter object as a substance.','Nothing can transfer unless one object melts.'],correct:0,explain:'Temperature difference drives net thermal energy transfer until the system moves toward equilibrium.'},
 'Temperature describes thermal state; heat is energy in transfer because of a temperature difference. Keep those ideas separate.',
 null);

add('forces',
 'A puck is already moving on a very smooth surface. If almost nothing pushes backward, must a forward force keep acting to maintain its motion?',
 ['No — continuing motion does not require a net forward force in the ideal model.','Yes — motion always needs a forward force.','It must instantly stop when the push ends.'],
 ['Galileo used inclined-plane reasoning and experiments to separate motion from the everyday effects of friction. Newton later expressed a general rule: without a net force, velocity does not change.','The difficult conceptual step was recognising that everyday objects slow because forces such as friction act, not because “motion runs out.”'],
 {prompt:'A cart moves right while horizontal forces balance. In the ideal model, what changes?',choices:['Its velocity stays constant.','It must stop immediately.','It must accelerate right.'],correct:0,explain:'Zero net force means zero acceleration, not zero velocity.'},
 'Draw forces by direction, combine them to find the net force, then ask how that net force changes velocity.',
 null);

add('energy',
 'A falling weight turns a paddle in water and the water warms. Where did the warming come from?',
 ['The falling system transferred energy through mechanical work.','The thermometer created the energy.','The water must already have contained exactly that extra heat.'],
 ['James Joule used carefully measured mechanical work and temperature change to show a quantitative connection between work and heating. Similar evidence helped unify many apparently different processes under energy conservation.','The lesson was accounting: energy can change form and move between system and surroundings, while the total accounting remains consistent within the defined system.'],
 {prompt:'A device receives 100 J and gives 70 J of useful output. What should we ask about the other 30 J?',choices:['Which other forms or surroundings received it?','Where was it destroyed?','Which law lets us ignore it?'],correct:0,explain:'Conservation requires the full energy budget, including non-useful transfers such as heating or sound.'},
 'Follow energy from source to stores and transfers. “Useful” and “wasted” describe our goal, not whether energy still exists.',
 null);

add('magnets',
 'A compass needle suddenly turns when an electric current flows in a nearby wire. What could that mean?',
 ['Electric current can produce a magnetic effect.','The compass only responds to visible light.','Current and magnetism must be unrelated.'],
 ['In 1820, Hans Christian Ørsted observed a compass deflect near a current-carrying wire. Later, Michael Faraday investigated the reverse connection and showed that changing magnetic conditions could produce electrical effects.','These experiments linked two subjects that had seemed separate. Faraday’s notebooks and apparatus show how repeated changes in coils, magnets and motion were used to discover which conditions mattered.'],
 {prompt:'What is a better test of whether an unknown object is itself a magnet?',choices:['Look for repulsion from a known magnetic pole as well as attraction.','Test only whether it is attracted to iron.','Check whether it is shiny.'],correct:0,explain:'Magnetic materials can be attracted without being permanent magnets. Repulsion gives stronger evidence of a like pole.'},
 'Use evidence that distinguishes explanations. For electromagnets, change one intended variable while keeping distance, core and test object comparable.',
 {name:'Faraday’s experimental research on magnetic electricity — Royal Society',url:'https://makingscience.royalsociety.org/items/pt_73_15_3'});

add('classification',
 'A whale swims and looks fish-like. Should appearance and habitat decide its biological group?',
 ['Use multiple inherited characteristics and evidence of relatedness.','Group anything that lives in water as fish.','Use whichever single feature is easiest to see.'],
 ['Linnaeus developed a systematic naming and grouping scheme based largely on observable characteristics. Darwin’s evolutionary theory later changed the meaning of biological similarity by linking it to common ancestry. Modern molecular evidence can reveal relationships that appearance alone hides.','Classification therefore changes when better evidence about relatedness appears. A good key still uses observable features, but a scientific classification is an evidence-based model rather than a list to memorize forever.'],
 {prompt:'An unfamiliar animal flies and has six legs. Which fact is most useful for a simple school key?',choices:['The number of legs is a defined observable feature.','Anything that flies is a bird.','Its habitat determines all of its ancestry.'],correct:0,explain:'Classification should follow the stated evidence and key, not a familiar-looking shortcut.'},
 'Classify by explicit characteristics and be ready to revise a grouping when stronger evidence of relatedness appears.',
 null);

add('plants',
 'A candle goes out in a closed jar. After a green plant spends time in light, a candle can sometimes burn again. What changed?',
 ['The plant changed the composition of the air in light.','Plants create fire inside their leaves.','The glass jar itself produces oxygen.'],
 ['Joseph Priestley showed that plants could restore air that burning or animals had altered. Jan Ingenhousz later showed that the effect depended on light and green plant parts. Other investigators then clarified the roles of carbon dioxide and water.','The modern photosynthesis model grew from a sequence of experiments, not from naming a formula first. Different conditions were changed to discover what the plant actually needed and produced.'],
 {prompt:'What comparison best tests whether light is necessary for oxygen production by a green plant?',choices:['Comparable green plants in light and darkness, with the other important conditions kept similar.','A cactus in light versus a fish in darkness.','One plant measured only after the result is known.'],correct:0,explain:'Changing light while keeping the rest comparable isolates whether light contributes to the observed difference.'},
 'Photosynthesis is a model built from inputs, outputs and conditions. Use evidence to distinguish it from respiration rather than treating the equation as a chant.',
 null);

add('respiration',
 'An animal uses oxygen and releases carbon dioxide even when it is resting. Is breathing just moving air, or is a chemical process happening inside?',
 ['Measure gases and energy-related changes during respiration.','Assume oxygen is only needed for motion.','Decide from how fast the chest moves.'],
 ['Lavoisier and collaborators compared respiration with slow combustion by measuring oxygen use, carbon dioxide production and heat. The comparison was imperfect by modern standards, but it connected breathing with energy-releasing chemistry.','Later plant experiments made another important distinction: plants photosynthesise in light, but their cells also respire day and night. The two processes are related but not opposites that simply cancel at every moment.'],
 {prompt:'A plant is kept in darkness. Which process still occurs in its living cells?',choices:['Respiration.','Photosynthesis at the same rate as in bright light.','No energy-releasing chemistry at all.'],correct:0,explain:'Photosynthesis needs light; cellular respiration continues as cells release usable energy from stored molecules.'},
 'Ask which process is occurring, in which cells, under which conditions. Gas exchange observations are evidence, not merely vocabulary.',
 {name:'Lavoisier, respiration and measured gas exchange — Science History Institute',url:'https://www.sciencehistory.org/stories/magazine/probing-the-mysteries-of-human-digestion/'});

add('transport',
 'If the heart simply used up blood, how much blood would a person need to make every day?',
 ['Estimate the heart’s output and test whether circulation is a better explanation.','Assume blood disappears after reaching an organ.','Ignore the direction of valves.'],
 ['William Harvey combined anatomy, observations of heart motion, vein valves and quantitative estimates. The amount the heart moved was far too large to be continually made and consumed, supporting circulation in a loop.','This is a classic example of using a rough calculation to reject an explanation. Later microscopy filled in capillary connections that Harvey could not directly see.'],
 {prompt:'What evidence supports one-way blood flow in many veins?',choices:['Valves permit flow more easily in one direction than the other.','Blood is always blue in veins.','The heart is on the left side of the chest.'],correct:0,explain:'Valve orientation provides mechanical evidence about the direction of flow.'},
 'Connect structure to route and function: heart → vessels → exchange regions → return. A route model should agree with observed direction and conservation of material.',
 {name:'William Harvey and circulation — Royal Society collection',url:'https://pictures.royalsociety.org/image-rs-19740'});

add('digestion',
 'Does the stomach grind food only mechanically, or can its fluid chemically change food even outside the body?',
 ['Compare food exposed to gastric fluid with suitable controls.','Decide from how hard the stomach feels.','Assume chewing and digestion are the same process.'],
 ['In the 1800s, physician William Beaumont observed digestion through a patient’s unusual stomach opening and tested how foods changed in gastric fluid. The work helped show that digestion included chemical action, not only mechanical grinding.','The historical relationship between Beaumont and Alexis St. Martin raises serious ethical questions by modern standards. Science history includes how methods and research ethics both change.'],
 {prompt:'What observation best supports chemical digestion by gastric fluid?',choices:['Food changes in collected gastric fluid under suitable conditions outside the stomach.','Food gets smaller after chewing.','A person feels hungry before lunch.'],correct:0,explain:'If gastric fluid can change food outside the stomach, muscular grinding cannot be the whole explanation.'},
 'Digestion breaks large food molecules into absorbable forms through mechanical and chemical processes. Evidence can separate the roles.',
 {name:'Beaumont and St. Martin digestion experiments — Science History Institute',url:'https://www.sciencehistory.org/stories/magazine/probing-the-mysteries-of-human-digestion/'});

add('ecology',
 'A predator disappears from an ecosystem. Why can species that it never ate directly still change?',
 ['Because feeding relationships form networks with indirect effects.','Only the predator’s prey can ever change.','Every species changes in exactly the same direction.'],
 ['Early ecologists assembled feeding observations into food chains and then broader food webs. Charles Elton helped formalise thinking about food chains, niches and community relationships in the early twentieth century.','Field ecology showed why one isolated pair of species is often not enough. Energy flow, competition and indirect interactions can connect organisms through several steps.'],
 {prompt:'If a predator decreases and its prey increases, what is the safest next claim?',choices:['That change may affect the prey’s food and competitors, but the direction must be checked from the web.','Every producer must increase.','The whole ecosystem is now understood.'],correct:0,explain:'Food webs support conditional predictions. Trace the actual links instead of assuming every indirect effect has the same sign.'},
 'Follow arrows and material/energy pathways through the specified web. Treat the web as a model with omitted interactions, not a complete picture of nature.',
 null);

add('matter',
 'A sealed flask is heated and a solid changes into new substances. If nothing enters or leaves, should the total mass change?',
 ['No — weigh the entire closed system before and after.','Yes — new substances must create new matter.','Mass depends only on whether a gas is visible.'],
 ['Lavoisier made closed-system measurements central to chemistry. By weighing reactants and products, including gases, he showed that chemical change could be analysed without matter mysteriously appearing or vanishing.','This kind of mass balance helped overturn older explanations of combustion and encouraged particle-based accounts in which atoms are rearranged rather than created or destroyed in ordinary chemical reactions.'],
 {prompt:'Why is a sealed container especially useful for a conservation-of-mass test?',choices:['It prevents matter from quietly entering or leaving the measured system.','It guarantees no chemical reaction happens.','It makes every substance a solid.'],correct:0,explain:'A closed boundary lets before-and-after mass be compared without unmeasured gases escaping or entering.'},
 'Define the system boundary first. Then track matter through changes of state, dissolving and reactions without losing invisible gases from the accounting.',
 {name:'Lavoisier and conservation of mass — Science History Institute',url:'https://www.sciencehistory.org/stories/magazine/revolutionary-instruments-lavoisiers-tools-as-objets-dart/'});

add('changes',
 'Salt seems to disappear when it dissolves in water. Has it become a new substance or is it still recoverable?',
 ['Evaporate the water and examine what remains.','Assume invisible means destroyed.','Taste every unknown solution.'],
 ['Long before modern chemistry, practical separation methods such as evaporation, crystallisation, filtration and distillation let people recover substances from mixtures. Repeated recovery experiments helped distinguish mixing from chemical transformation.','Modern chemistry adds particle explanations and more precise tests, but the reasoning remains powerful: if components can be separated by physical processes and retain their properties, that evidence supports a mixture model.'],
 {prompt:'Which result most strongly supports “salt water is a mixture”?',choices:['Salt crystals can be recovered after the water is evaporated.','The solution looks clear.','The beaker feels cool.'],correct:0,explain:'Recovering a component by a physical separation shows it was present even when it was not visible.'},
 'Choose a separation method from differences in properties: particle size, solubility, boiling behaviour or magnetism — not from memorised equipment names alone.',
 null);

add('density',
 'A heavy steel ship floats while a small steel ball sinks. How can “heavy things sink” be the wrong rule?',
 ['Compare displaced fluid and average density, not mass alone.','Anything made of steel must sink.','Large objects always float.'],
 ['Archimedes’ surviving work On Floating Bodies developed a mathematical account of floating and buoyancy. The famous bathtub-and-crown story was written much later and should be treated as a legend, not direct evidence of how the principle was discovered.','The enduring scientific idea is testable: an immersed object experiences an upward effect related to displaced fluid, and floating depends on the whole object’s mass relative to the volume it occupies.'],
 {prompt:'Why can a hollow steel ship float?',choices:['Its total mass spread over its large volume can give an average density below that of water.','Steel loses all its mass in water.','Water stops exerting gravity on large objects.'],correct:0,explain:'Shape changes the volume of water displaced and therefore the average-density/buoyancy balance.'},
 'Use the stated density or buoyancy model. Avoid replacing it with the unreliable shortcut “heavy sinks, light floats.”',
 null);

add('water',
 'Rivers keep flowing even when the sea is far away. Could ordinary rainfall really supply enough water?',
 ['Measure rainfall over a drainage area and compare it with river flow.','Assume underground oceans must feed every river.','Judge by one rainy afternoon.'],
 ['In the 1600s, Pierre Perrault and Edme Mariotte used measurements of rainfall and river flow in the Seine basin to test whether precipitation could account for rivers and springs. Their quantitative work helped put hydrology on an observational foundation.','Some details of early models were wrong, but the important change was methodological: measure the water budget instead of relying on ancient authority about hidden sources.'],
 {prompt:'What comparison tests whether rainfall could supply a river basin?',choices:['Total precipitation over the basin versus runoff, storage and losses over a suitable period.','The colour of the river versus the colour of clouds.','One bucket of rain versus the width of the river.'],correct:0,explain:'A water budget must compare compatible totals over the relevant area and time.'},
 'Track water through evaporation, condensation, precipitation, infiltration, storage and runoff. The cycle is a conservation model with reservoirs and flows.',
 {name:'Perrault and quantitative hydrology — U.S. Geological Survey',url:'https://www.usgs.gov/publications/pierre-perrault-man-and-his-contribution-modern-hydrology'});

add('earth',
 'Through a telescope, Venus shows a wide range of phases. Which arrangement of Sun, Earth and Venus can produce all of them?',
 ['A model in which Venus orbits the Sun.','Any Earth-centred arrangement gives the same predicted phases.','Phases are caused by clouds crossing Venus.'],
 ['In the early 1600s, telescopic observations such as the phases of Venus and moons orbiting Jupiter challenged simple versions of an Earth-centred cosmos. Galileo publicised these observations while debates over competing planetary models continued.','No single observation instantly settled every astronomical question. The important lesson is that geometric models make different predictions, and new instruments can expose observations that discriminate between them.'],
 {prompt:'Why are the ordinary phases of our Moon not lunar eclipses?',choices:['Phases are different views of the Moon’s sunlit half; an eclipse needs special alignment with Earth’s shadow.','Every crescent is Earth’s shadow.','The Moon changes shape each month.'],correct:0,explain:'Phase depends on viewing geometry. An eclipse is a separate shadow event requiring particular alignment.'},
 'Use a Sun–Earth–Moon model to make spatial predictions, while remembering that classroom diagrams are not drawn to scale.',
 null);

add('technology',
 'A glider produces much less lift than accepted calculations predict. Should an engineer keep trusting the table or test the assumptions?',
 ['Build controlled tests and collect new data.','Make the same glider bigger without checking the model.','Choose the result that agrees with the textbook.'],
 ['The Wright brothers’ early gliders produced less lift than their calculations predicted. They built wind tunnels and balances, tested many wing shapes, and gathered their own lift-and-drag data before designing later gliders.','Their story is useful because engineering is not “apply a formula and hope.” A failed prediction can reveal a bad assumption, incomplete data or a scale effect. The design cycle turns discrepancies into new tests.'],
 {prompt:'What is the strongest response when a prototype disagrees with a model?',choices:['Check measurements, assumptions and competing designs with targeted tests.','Hide the failed trial.','Keep only data that match the model.'],correct:0,explain:'A mismatch is information. Good engineering uses it to decide what to measure or change next.'},
 'For unfamiliar technology, identify input, mechanism, measurable output, constraints and trade-offs. Use evidence to revise the design rather than memorising a product description.',
 {name:'Wright brothers wind-tunnel research — Smithsonian National Air and Space Museum',url:'https://airandspace.si.edu/explore/stories/researching-wright-way'});

root.MochiScienceDiscovery={stories,get:id=>stories[id]||null};
if(typeof module!=='undefined')module.exports=root.MochiScienceDiscovery;
})(typeof globalThis!=='undefined'?globalThis:this);
