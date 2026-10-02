/* One-step Quick checks matched to the exact question type on screen.
   Keyed by subject → unit → question form (0–3). Each check targets the relationship
   needed for that form, never the numerical answer. Presentation only: using a Quick
   check is still recorded as help by the existing pathway engines. */
(function(root){
'use strict';
const q=(prompt,choices,correct,explain)=>({prompt,choices,correct,explain});
const maths={
 relationships:[
  q('To undo “multiply, then add”, which step do you undo first?',['Divide the result first.','Take away the amount that was added.','Add the two given numbers.'],1,'Undo the last step first. Remove what was added, then divide to undo the multiplication.'),
  q('If you subtract the known difference from the total of two amounts, what remains?',['One copy of the larger amount.','Two equal copies of the smaller amount.','The difference again.'],1,'Removing the extra part makes the two amounts equal, so what remains is twice the smaller amount.'),
  q('One folded length is the depth minus a few centimetres. What do three folded lengths make together?',['The whole cord.','The depth of the container.','One third of the cord.'],0,'Three equal folded lengths rebuild the whole cord. Write that as an equation with the cord’s length in terms of the depth.'),
  q('Let h be the shelf height and d the difference between the vases. With the tall vase on the shelf, how much higher is its top?',['h − d','d − h','h + d'],2,'The shelf lifts it by h and the tall vase adds d more. After the swap the gap is h − d. Adding the two facts gives 2h.')
 ],
 percent:[
  q('After a charge is added, the new price is what percentage of the original price?',['Less than 100%.','Exactly 100%.','100% plus the charge.'],2,'The original price is 100%. Adding a charge makes the new price more than 100% of it.'),
  q('After a 20% discount, the sale price is what percentage of the original price?',['120%','80%','20%'],1,'The original is 100%. Removing 20% leaves 80%, so the sale price is 80% of the original.'),
  q('A second discount is taken from the already-reduced price. Which amount is 100% for that second discount?',['The original price.','The reduced price.','The final price.'],1,'Each percentage applies to the amount just before it. The second discount is a percentage of the reduced price.'),
  q('One group falls by 10% and the other rises by 20%. What does each percentage apply to?',['Each group’s own starting size.','The total of both groups.','The difference between the groups.'],0,'A percentage change is always a percentage of its own whole. Work out each group’s change from its own starting number.')
 ],
 remainders:[
  q('After 1/3 is used, “1/4 of the remaining” is a quarter of what?',['The whole roll.','The 2/3 that is left.','The 1/3 that was used.'],1,'“Of the remaining” means the new whole is what is left after the first step: 2/3 of the roll.'),
  q('Working backwards from the money left, which step do you undo first?',['The 1/4 that was spent.','The extra dollars spent last.','Neither — start from the beginning.'],1,'Undo the last action first. Add back the extra dollars; that amount is the 3/4 left after the first spending.'),
  q('Working backwards from the pencils left, which step do you undo first?',['The pencils given away.','The morning sale.','The afternoon sale.'],0,'The giving-away happened last, so undo it first. Then undo the afternoon fraction, then the morning one.'),
  q('Beads move between boxes A and B. What stays the same throughout?',['The number in A.','The total in both boxes.','The number in B.'],1,'Moving beads changes each box but never the total. Use the total to recover the other box at each stage.')
 ],
 simultaneous:[
  q('If every vehicle were a bicycle, how would the wheel count compare with the real count?',['Too high.','Too low.','Exactly right.'],1,'Each cart treated as a bicycle loses 2 wheels. The missing wheels ÷ 2 gives the number of carts.'),
  q('To find the price of one notebook, which first move helps most?',['Add the two totals.','Double the first statement so both mention four notebooks.','Divide each total by five.'],1,'With the same number of notebooks in both statements, the difference comes only from the pens.'),
  q('From “years ago” to “in some years’ time”, how does the age gap between adult and child change?',['It grows.','It stays the same.','It shrinks.'],1,'Both people age by the same number of years, so the difference in their ages never changes.'),
  q('You know the cost of two different mixes of panels and brackets. What is a reliable first step?',['Add the two costs and halve.','Assume a panel and a bracket cost the same.','Make the number of panels match in both mixes, then compare.'],2,'When one item appears equally in both statements, the difference in cost comes from the other item alone.')
 ],
 ratios:[
  q('White beads are shown as some units, and you know how many white beads there are. What do you find first?',['The difference in units.','The value of one unit.','The total number of units only.'],1,'Divide the known white beads by the white units to find one unit. Then scale to the total.'),
  q('Red tiles never change. How should you compare the before and after ratios?',['Make the blue parts equal.','Add the two ratios.','Make the red parts equal in both ratios.'],2,'Red is unchanged, so give red the same number of units in both ratios. The change in blue units is the tiles added.'),
  q('Moving counters from A to B keeps which amount the same?',['The number in A.','The number in B.','The total.'],2,'A move changes each box but not the total. With 5:3 the total is 8 units; equal boxes have 4 units each.'),
  q('The same water is shared among all the cans. What stays fixed?',['The total water.','The litres each can gets.','The number of cans in group A.'],0,'The total water is fixed. Find how many cans each group has from that total, then share among all of them.')
 ],
 rates:[
  q('At a constant rate, if the number of parts doubles, what happens to the time?',['It halves.','It doubles.','It stays the same.'],1,'At a constant rate, time is proportional to the work done.'),
  q('Two pumps fill the same tank together. What can you add?',['Their times in hours.','The fraction of the tank each fills in one hour.','The tank sizes.'],1,'Rates add, times do not. Add each pump’s fraction of a tank per hour.'),
  q('You know the pair’s combined rate and the first worker’s rate. How do you find the second worker’s rate?',['Add the two rates.','Subtract the first rate from the combined rate.','Average the two rates.'],1,'The combined rate is the sum of both rates, so subtract the known one.'),
  q('Water flows in while a pump removes it. How fast does the tank really empty?',['Pump rate minus inflow rate.','Pump rate plus inflow rate.','The pump rate alone.'],0,'The inflow works against the pump, so the net emptying rate is the difference.')
 ],
 motion:[
  q('Two walkers move towards each other. How fast does the gap between them close?',['The sum of their speeds.','The difference of their speeds.','The faster speed only.'],0,'Both are closing the same gap at once, so their speeds add.'),
  q('For the whole journey, average speed equals…',['The mean of the two speeds.','Total distance ÷ total time.','The slower speed.'],1,'More time is spent at the slower speed, so averaging the two speeds gives the wrong answer.'),
  q('Which quantity lets you find the drone’s total distance most simply?',['The length of its first trip.','The number of trips it makes.','How long it flies until the walkers meet.'],2,'The drone flies at one constant speed for the whole time the walkers take to meet. Distance = speed × time.'),
  q('Walking with the walkway, the child’s speed over the ground is…',['Walking speed − walkway speed.','Walking speed + walkway speed.','Walkway speed only.'],1,'With the walkway the speeds add; against it they subtract. Use both crossing times.')
 ],
 capacity:[
  q('A rack holds L large trays or S small trays. One large tray takes the space of how many small trays?',['S ÷ L','L ÷ S','S − L'],0,'The whole rack is L large or S small, so one large tray uses S ÷ L small trays’ worth of space.'),
  q('The rack holds a mix of large and small trays. What should you do first?',['Add the two tray counts.','Convert everything into the same kind of tray space.','Ignore the small trays.'],1,'Express all trays in one unit of space. Then subtract from the full rack to find what is left.'),
  q('To make room for large boxes, think of each large box as…',['One small box.','A fixed number of small boxes’ worth of space.','Half a small box.'],1,'Convert the large boxes into small-box spaces, then compare with the space already used.'),
  q('To fit the greatest number of books, which books should fill the remaining space?',['Wide books.','Narrow books.','An equal mix.'],1,'After the required books, thinner books let you fit more in the same length.')
 ],
 area:[
  q('Which length goes with the base to find a triangle’s area?',['A sloping side.','The perpendicular height.','The longest side.'],1,'Area = base × perpendicular height ÷ 2. The height must be at right angles to the base.'),
  q('Two triangles share the same height. If one base is 2.5 times as long, what happens to its area?',['Its area stays the same.','Its area is 2.5 times as large.','Its area is squared.'],1,'With the same height, triangle area is directly proportional to the base length.'),
  q('Triangles share apex A and have bases along BC. Their areas are in the same ratio as…',['Nothing — they are equal.','Their slanted side lengths.','Their base lengths.'],2,'They share the same perpendicular height from A, so area depends only on the base.'),
  q('Two triangles share the same height. The ratio of their areas equals…',['The ratio of their heights.','The ratio of their bases.','1 : 1.'],1,'Equal heights mean area is proportional to base. Use the area ratio to split BC.')
 ],
 decomposition:[
  q('A path runs just inside all four edges. A clean way to find its area is…',['Whole rectangle − inner rectangle.','Add four strips of full length.','Perimeter × path width.'],0,'Subtract the inner rectangle. Remember the border comes off both ends of each side.'),
  q('EG splits the rectangle into two smaller rectangles. Each shaded triangle with base EG is what fraction of its smaller rectangle?',['A quarter.','A half.','A third.'],1,'A triangle with the same base and height as a rectangle has half its area. The two halves add to half the whole.'),
  q('Which approach suits a shaded shape formed by lines inside a square?',['Measure the picture with a ruler.','Guess from the picture.','Find congruent or similar pieces and subtract what you can calculate.'],2,'Look for matching triangles created by the symmetry, then work from areas you can calculate.'),
  q('Two squares overlap. The total area they cover is…',['The sum of both squares.','The sum minus the overlap once.','The sum minus the overlap twice.'],1,'The overlap is counted in both squares, so remove it once.')
 ],
 circles:[
  q('A semicircle’s full perimeter is…',['Half the circumference only.','Half the circumference plus the diameter.','The full circumference.'],1,'“Full perimeter” includes the straight edge, which is the diameter.'),
  q('What is half the circumference of a circle with diameter d?',['πd','πd²','πd ÷ 2'],2,'The full circumference is πd, so a semicircular arc is πd ÷ 2.'),
  q('If one radius is k times another, the area is…',['k times as large.','k² times as large.','2k times as large.'],1,'Area depends on radius × radius, so scaling the radius by k scales area by k × k.'),
  q('A circle touching all four sides of a square has a diameter equal to…',['The square’s side.','The square’s diagonal.','Half the square’s side.'],0,'The circle touches opposite sides, so its diameter fits exactly across the square.')
 ],
 angles:[
  q('In triangle ABC with AB = AC, which two angles are equal?',['A and B.','A and C.','B and C.'],2,'Equal sides face equal angles. AB and AC face angles C and B.'),
  q('In triangle ABC with AB = AC, which two angles are equal?',['A and B.','B and C.','A and C.'],1,'Equal sides face equal angles. Then an exterior angle and its interior angle make 180°.'),
  q('The five tip angles of a star drawn in a circle add up to…',['180°','360°','540°'],0,'Each tip angle is half the central angle on its arc, and the five arcs make one full turn: 360° ÷ 2 = 180°.'),
  q('Which sides of triangle ABE are equal?',['AE and BE.','BA and BE.','AB and AE.'],1,'BA is a side of the square, and BE equals BC, another side. So triangle ABE is isosceles.')
 ],
 spatial:[
  q('On a cube net, two faces in a straight row with one face between them are…',['Next to each other.','Opposite.','The same face.'],1,'When folded, the middle face bends between them, so they end up on opposite sides.'),
  q('On a cube net, two faces in a straight row with one face between them are…',['Next to each other.','Opposite.','The same face.'],1,'When folded, the middle face bends between them, so they end up on opposite sides.'),
  q('In one view of a cube, can two faces you see at the same time be opposite?',['Yes.','No.'],1,'Opposite faces can never be seen together. Faces seen together are neighbours.'),
  q('In one view of a cube, can two faces you see at the same time be opposite?',['Yes.','No.'],1,'Opposite faces can never be seen together. Faces seen together are neighbours.')
 ],
 volume:[
  q('The edge of a cube with volume V is the number that…',['Multiplied by itself three times gives V.','Times 3 gives V.','Times 6 gives V.'],0,'Volume = edge × edge × edge, so look for a number cubed.'),
  q('Two cubes touch face-to-face. How many square faces stop being exposed?',['One face total.','Two faces — one from each cube.','Four faces.'],1,'The touching face on each cube becomes hidden, so one join hides two faces.'),
  q('When a small cube is cut from a corner, the total surface area…',['Decreases.','Stays the same.','Increases.'],1,'Three outer squares are removed, but three inner squares of the same size are revealed.'),
  q('A square tunnel goes right through a cube. What happens to the surface?',['Nothing changes.','Only the two openings are lost.','Two openings are lost and four tunnel walls are added.'],2,'Subtract the two square holes, then add the four rectangular walls inside the tunnel.')
 ],
 factors:[
  q('For 2^a × 3^b, a factor can use the prime 2 raised to any power from…',['1 to a.','0 to a.','a only.'],1,'Using 2⁰ means not using 2 at all, so there are a + 1 choices.'),
  q('For the least common multiple, which prime powers should you keep?',['Only primes that appear in both numbers.','The highest power of every prime needed by either number.','The lowest power of each prime.'],1,'The LCM must contain enough of every prime factor to be divisible by each number.'),
  q('A number with exactly 6 factors has prime exponents of…',['1, 1 and 1.','6.','5, or 2 and 1.'],2,'Factor count multiplies (exponent + 1). 6 = 6 or 3 × 2, so the exponents are 5, or 2 and 1.'),
  q('A factor divisible by 6 must contain…',['At least one 2 and at least one 3.','A 5.','Exactly one 2.'],0,'6 = 2 × 3, so each chosen factor needs both primes at least once.')
 ],
 cycles:[
  q('Dividing N by d gives a remainder r. Which must be true?',['r is smaller than d.','r is larger than d.','r equals d.'],0,'Write N = d × quotient + r, with r from 0 up to d − 1.'),
  q('Each remainder is one less than its divisor. What does adding 1 to the number do?',['Nothing useful.','Makes it a multiple of every divisor.','Doubles the remainders.'],1,'One more than the number divides exactly, so it is a common multiple. Start from the LCM.'),
  q('Remainders of repeated multiplication by the same number…',['Repeat in a cycle.','Keep growing.','Are always zero.'],0,'Only a few remainders are possible, so they must eventually repeat. Find the cycle length.'),
  q('Three lights flash together. When do they next flash together?',['At the sum of the three intervals.','At a common multiple of the three intervals.','At the largest interval.'],1,'They meet again at the LCM of the intervals, and then every LCM after that.')
 ],
 counting:[
  q('A plays B and B plays A. Is that two different matches?',['No — it is one match.','Yes — two matches.'],0,'Each match is a pair. Counting each player’s opponents counts every match twice.'),
  q('If the same two boundary lines are chosen in the opposite order, is that a new rectangle?',['Yes — the order makes a new rectangle.','No — it is the same rectangle.'],1,'A rectangle is fixed by a pair of vertical and a pair of horizontal lines. Order does not matter.'),
  q('Each team takes one pupil from each club. How do you count the teams?',['Add the club sizes.','Multiply the club sizes.','Use the larger club only.'],1,'Every pupil from the first club can pair with every pupil from the second.'),
  q('A new line crosses k existing lines. How many new regions does it make?',['k','k + 1','2k'],1,'Crossing k lines cuts the new line into k + 1 pieces, and each piece splits a region in two.')
 ],
 digits:[
  q('Reversing a two-digit number with digits a and b changes it by…',['9 × (a − b)','11 × (a − b)','(a − b)'],0,'(10a + b) − (10b + a) = 9a − 9b.'),
  q('For a palindrome, which digits can you choose freely?',['All of them.','The first half; the rest are mirrored.','Only the middle digit.'],1,'The second half copies the first. The leading digit cannot be 0.'),
  q('A three-digit palindrome aba is divisible by 3 or 9 when…',['a + b is.','2a + b is.','b alone is.'],1,'Its digit sum is a + b + a = 2a + b.'),
  q('A five-digit palindrome abcba is divisible by 3 when…',['2a + 2b + c is.','a + b + c is.','c alone is.'],0,'The digit sum is a + b + c + b + a. Count the c values that work for each a and b.')
 ],
 sums:[
  q('To add a long run of consecutive whole numbers quickly, you can…',['Pair first with last.','Multiply the first and last.','Add only the even numbers.'],0,'Each first-and-last pair has the same total. Number of terms × average term gives the sum.'),
  q('In 1 − 2 + 3 − 4 + …, what does each pair (1 − 2), (3 − 4) equal?',['1','−1','0'],1,'Every pair is −1. Count the pairs, then add any unpaired last term.'),
  q('a² − b² can be found as…',['(a − b)²','(a − b)(a + b)','a − b'],1,'The difference of two squares factorises, avoiding two large multiplications.'),
  q('To find a run of square numbers that does not start at 1, you can…',['Use 1² up to the end, minus 1² up to just before the start.','Square the sum of the bases.','Multiply first and last squares.'],0,'Work out the two totals from 1², then subtract to keep only the run you need.')
 ],
 patterns:[
  q('Each new square shares a side with the one before. How many new sticks does it add?',['4','3','2'],1,'The shared side is already there, so each new square needs 3 sticks.'),
  q('The first square uses 4 sticks and each next one adds 3. Which formula fits n squares?',['3n + 1','4n','4n − 1'],0,'4 + 3(n − 1) = 3n + 1.'),
  q('Rows grow by the same amount each time. To add all rows quickly, you can…',['Pair the top and bottom rows.','Multiply top and bottom rows.','Use only the bottom row.'],0,'The rows form an equally spaced sequence. Number of rows × average row gives the total.'),
  q('Blocks 1, 2, 3, … contain 1, 2, 3, … terms. How many terms do the first k blocks contain?',['k²','k(k + 1) ÷ 2','2k'],1,'That is 1 + 2 + … + k. Find the block where the required position falls.')
 ],
 spirals:[
  q('The step lengths go 1, 1, 2, 2, 3, 3, … . What is a useful way to group them?',['In pairs of equal length.','In threes.','One at a time only.'],0,'Each pair of equal lengths turns the corner twice. Count complete pairs first.'),
  q('The pen draws lengths 1, 1, 2, 2, … . How do you find how much of the last segment is drawn?',['Add complete lengths until the next would pass the total.','Divide the total by 4.','Use the longest segment.'],0,'Subtract the length used by complete segments from the total drawn.'),
  q('The step lengths go 1, 1, 2, 2, 3, 3, … . What is a useful way to group them?',['In pairs of equal length.','In threes.','One at a time only.'],0,'Each pair of equal lengths turns the corner twice. Count complete pairs first.'),
  q('Number 1 is at the centre. How many moves does it take to reach number N?',['N','N − 1','N + 1'],1,'Each move goes to the next number, and number 1 needs no move.')
 ],
 cases:[
  q('Two labels say exactly opposite things. How many of them can be true?',['Both.','Exactly one.','Neither.'],1,'Opposite statements cannot both be true or both false. Use that to decide the third label.'),
  q('Two labels say exactly opposite things. How many of them can be true?',['Both.','Exactly one.','Neither.'],1,'Opposite statements cannot both be true or both false. Use that to decide the third label.'),
  q('AB + BA equals…',['11 × (A + B)','10 × (A + B)','A + B'],0,'(10A + B) + (10B + A) = 11A + 11B.'),
  q('One condition says y = x + 1. What should you do with it?',['Ignore it.','Substitute it into the other condition.','Add it to the other condition.'],1,'Replacing y leaves one equation with only x.')
 ],
 invariants:[
  q('Every allowed move changes the number by an even amount. What never changes?',['The size of the number.','Whether the number is odd or even.','The last digit.'],1,'Adding or subtracting even numbers keeps odd numbers odd and even numbers even.'),
  q('A switch is flipped once for each factor of its number. Which switches have an odd number of factors?',['Prime numbers.','Perfect squares.','Even numbers.'],1,'Factors come in pairs except when a factor is paired with itself, which happens only for squares.'),
  q('To guarantee a result when drawing without looking, which case should you imagine?',['The luckiest case.','The worst possible case.','The average case.'],1,'Imagine drawing as many as possible without succeeding. One more draw then forces success.'),
  q('Cards pair up to make the target sum. How many cards can you take without completing a pair?',['One from every pair.','Two from every pair.','None.'],0,'Taking one from each pair avoids the sum. One more card must complete a pair.')
 ],
 'geo-measure':[
  q('Which unit measures a length, a covering, or a filling?',['cm for length, cm² for covering, cm³ for filling.','cm² for everything.','cm³ for length.'],0,'Count the lengths multiplied: one length is cm, two give cm², three give cm³.'),
  q('Which unit measures a length, a covering, or a filling?',['cm for length, cm² for covering, cm³ for filling.','cm² for everything.','cm³ for length.'],0,'Count the lengths multiplied: one length is cm, two give cm², three give cm³.'),
  q('Multiplying two lengths together measures…',['A length.','An area (cm²).','A volume (cm³).'],1,'Two lengths multiplied cover a flat surface. Three lengths multiplied fill a space.'),
  q('Multiplying three lengths together measures…',['A length.','An area (cm²).','A volume (cm³).'],2,'Three lengths multiplied fill a space, so the unit is cm³.')
 ],
 'geo-layers':[
  q('A cuboid is built in layers of unit cubes. What is its volume?',['Cubes in one layer × number of layers.','Cubes along one edge × 3.','Cubes in one layer + number of layers.'],0,'Each layer has the same number of cubes, so multiply one layer by the number of layers.'),
  q('A cube’s edge e satisfies which equation for volume V?',['3 × e = V','e × e × e = V','e × e = V'],1,'All three edges are equal, so volume is e multiplied by itself three times.'),
  q('You know the base area and the volume. How do you find the height?',['Volume × base area.','Volume ÷ base area.','Base area − volume.'],1,'Each 1 cm layer holds one base area of cubes. The number of layers is the height.'),
  q('You know the volume and the area of one cross-section. How do you find the remaining length?',['Volume ÷ cross-section area.','Volume × cross-section area.','Cross-section area ÷ volume.'],0,'Volume = cross-section area × length, so divide.')
 ],
 'geo-one-face':[
  q('Which measurements belong to the area of one rectangular face?',['The two edges on that face.','All three dimensions of the solid.','All six faces.'],0,'Trace the two edges on the named face. Multiply them to count square units.'),
  q('A label covers only the front face. Which dimensions do you multiply?',['Length × height of that face.','Length × width × height.','Six times one edge.'],0,'Covering is a two-dimensional area, not the volume inside.'),
  q('A rectangular face has area 20 cm² and width 5 cm. How do you find its other edge?',['20 ÷ 5','20 × 5','20 ÷ 3'],0,'Area = width × other edge. Divide by the known width.'),
  q('You know one face’s area and one of its edges. The other edge is…',['Area ÷ known edge.','Area × known edge.','Area ÷ 3.'],0,'Rebuild the original area to check the missing edge.')
 ],
 'geo-face-pairs':[
  q('The top and bottom faces match. If one has area A, together they cover…',['2 × A','6 × A','A × height'],0,'Count these two matching faces, not every face or the volume.'),
  q('A cuboid has which three pairs of matching faces?',['Top/bottom, front/back and left/right.','All six faces always have the same area.','Only the visible three faces.'],0,'Match opposite rectangles, then add each pair once.'),
  q('Two matching labels together cover 40 cm². Each label is 5 cm wide. What is its other edge?',['40 ÷ 2 ÷ 5','40 ÷ 5','40 × 2 × 5'],0,'Find the area of one label before finding its missing edge.'),
  q('To find an edge from the total area of two matching rectangles, first…',['Divide the total area by two.','Multiply by two.','Divide by three.'],0,'Two equal rectangles share the total equally.')
 ],
 'geo-surface':[
  q('One face of a cube with edge a has area…',['a × a','a × a × a','6 × a'],0,'Each face is a square with side a.'),
  q('A closed cuboid’s faces come in how many matching pairs?',['Two pairs.','Three pairs.','Six different faces.'],1,'Front/back, top/bottom and left/right each match.'),
  q('Two cubes touch face-to-face. How many square faces stop being exposed?',['One face total.','Two faces — one from each cube.','Four faces.'],1,'The touching face on each cube becomes hidden, so one join hides two faces.'),
  q('Cubes in a row are joined along faces. Each join hides how many faces?',['One.','Two.','Four.'],1,'Each join hides one face from each of the two cubes.')
 ],
 'geo-angles':[
  q('An angle is named by its two arms. Which arms make an exterior angle at C?',['CA and the extended line CD.','CA and CB.','AB and BC.'],0,'The interior angle uses CA and CB. Extending BC to D makes the outside opening between CA and CD.'),
  q('Angles on a straight line add to…',['90°','180°','360°'],1,'The interior and exterior angles at C sit on a straight line, so together they make 180°.'),
  q('Three adjacent openings make a straight angle. What is their total?',['90°','180°','360°'],1,'Subtract the known parts from 180°.'),
  q('Three adjacent openings make a straight angle. What is their total?',['90°','180°','360°'],1,'Subtract the known parts from 180°.')
 ],
 'ch-totals':[
  q('Saturday’s adult tickets fell by 10% on Sunday. Sunday’s adult tickets are what fraction of Saturday’s?',['0.1','0.9','1.1'],1,'A 10% fall keeps 90% of the original, so multiply Saturday’s number by 0.9.'),
  q('Pia plus the pile is 5 times what Qi and Ravi have together. The grand total is how many times what Qi and Ravi have?',['5','6','4'],1,'The grand total is Pia plus the pile (5 parts) plus Qi and Ravi (1 part): 6 parts.'),
  q('Working backwards, Hoops kept “half minus 1”. Hoops now has 9. How many did it have before?',['20','18','16'],0,'Half minus 1 is 9, so half is 10 and the whole is 20.'),
  q('Grass keeps growing. Cow + goat take 30 days and the cow alone takes 60. What does subtracting the two daily rates tell you?',['The growth rate','The goat’s rate','The total grass'],1,'Growth and the cow appear in both, so they cancel. What is left is the goat’s daily eating.')
 ],
 'ch-motion':[
  q('The shop is 40 m from the midpoint, on Ben’s side. How much further does Mia ride than Ben?',['40 m','80 m','20 m'],1,'Mia rides half the gap plus 40 m; Ben rides half the gap minus 40 m. The difference is 80 m.'),
  q('Starting and arriving together, Mia rides 80 m further and gains 20 m every minute. How long do they ride?',['4 minutes','100 minutes','60 minutes'],0,'The extra distance builds up at the speed difference: 80 ÷ 20 = 4 minutes.'),
  q('Walking UP an up-escalator, how are the visible steps made up?',['My steps − escalator steps','My steps + escalator steps','Escalator steps only'],1,'Both you and the escalator move you upward, so the two step counts add to the visible steps.'),
  q('Running down an up-escalator, how are the visible steps made up?',['My steps − escalator steps','My steps + escalator steps','Escalator steps only'],0,'The escalator carries you back up, so your steps exceed the visible steps by what the escalator moves.')
 ],
 'ch-circles':[
  q('Rectangle OCDE has O at the centre and D on the arc. Which length equals CE?',['OC','OD, a radius','DE'],1,'The diagonals of a rectangle are equal, and OD is a radius.'),
  q('Why can the sides of a hexagon in a circle be rearranged without changing its area?',['Each side and the centre make a triangle that depends only on that side.','The hexagon is regular.','All circles have the same area.'],0,'The hexagon is made of six centre triangles. Moving them round the circle keeps each one’s area.'),
  q('A circle sits exactly inside a square, and the square sits exactly inside a bigger circle. The bigger circle’s area is…',['twice the smaller circle’s','four times the smaller circle’s','the same'],0,'The square’s diagonal is the big diameter and its side is the small diameter, so R² = 2r².'),
  q('Two semicircles overlap inside a quarter circle. When you subtract both semicircles, what happens to their overlap?',['It is subtracted twice, so add it back once.','It is subtracted once, which is correct.','It can be ignored.'],0,'Inclusion–exclusion: anything counted in both semicircles was removed twice.')
 ],
 'ch-angles':[
  q('A segment goes 3 right and 1 up. Which move is at right angles to it?',['1 left and 3 up','3 left and 1 up','1 right and 3 up'],0,'Turning through a right angle swaps the moves and changes one direction.'),
  q('Two grid angles together make the angle of a segment that goes 5 right and 5 up. What is their sum?',['45°','90°','50°'],0,'Equal right and up moves make a square’s diagonal: 45°.'),
  q('Three squares overlap in two rectangles. What is the total area?',['Sum of squares − both overlaps','Sum of squares + both overlaps','Sum of squares − twice each overlap'],0,'Each overlap was counted in two squares, so remove it once.'),
  q('The middle square is taller than the left square. Which vertical edge between them can you see?',['The difference in their heights','The left square’s full height','None'],0,'Only the part of the taller square sticking up above the shorter one is on the outline.')
 ],
 'ch-number':[
  q('N = 2³ × 3² × 5. How many choices are there for the power of 2 in a factor?',['3','4','2'],1,'The power can be 0, 1, 2 or 3: four choices.'),
  q('For an ODD factor of 2³ × 3² × 5, how many choices are there for the power of 2?',['One: 2⁰','Four','Three'],0,'Any factor using 2¹ or more is even, so only 2⁰ is allowed.'),
  q('m² − n² = 32 with whole numbers. Which factor pair of 32 can be (m − n) and (m + n)?',['1 and 32','2 and 16','Both'],1,'The factors must be both even or both odd. 1 and 32 have different parity.'),
  q('In a letter sum, the answer has one more digit than either number added. What is its first digit?',['0','1','9'],1,'Two numbers of the same length add to less than twice the largest, so the extra digit is a carry of 1.')
 ],
 'ch-sequences':[
  q('2, 5, 10, 17, 26, … The differences 3, 5, 7, 9 go up by 2. What is the next term?',['35','37','36'],1,'Next difference 11; 26 + 11 = 37.'),
  q('In a Fibonacci-type sequence, how is each new term made?',['Add the two terms before it.','Double the term before it.','Add 1 to the term before it.'],0,'Each term after the first two is the sum of the previous two.'),
  q('Each term is the sum of the two before. The 6th term is 21 and the 7th is 34. What is the 5th?',['13','55','8'],0,'Work backwards by subtracting: 34 − 21 = 13.'),
  q('2, 3, 5, 9, 17, … What happens to the differences 1, 2, 4, 8?',['They double.','They go up by 1.','They stay the same.'],0,'Doubling differences give 16 next, so the next term is 33.')
 ],
 bounds:[
  q('To find the most tokens for a budget, what is the safest approach?',['Buy as many of the biggest pack as possible.','Check each possible number of one pack type, and fill the rest well.','Buy only the cheapest pack.'],1,'The best choice is not always the biggest pack. A short organised list avoids missing the best case.'),
  q('Two group counts add to more than everyone in the class. What does the excess tell you?',['At least that many must be in both.','At most that many are in both.','Nothing.'],0,'If the total of two groups exceeds the class size, the overlap must make up the difference.'),
  q('To find the most tokens for a budget, what is the safest approach?',['Buy as many of the biggest pack as possible.','Check each possible number of one pack type, and fill the rest well.','Buy only the cheapest pack.'],1,'The best choice is not always the biggest pack. A short organised list avoids missing the best case.'),
  q('Pupils who join both clubs appear in both lists. How many join at least one club?',['Robotics + music.','Robotics + music − both.','Robotics + music + both.'],1,'Subtract the overlap once so no pupil is counted twice. Neither = total − that number.')
 ]
};
const science={
 evidence:[
  q('Which of these is an observation rather than an explanation?',['What was measured or seen.','Why you think it happened.','A guess about other cases.'],0,'An observation records what was seen or measured. An explanation suggests a cause.'),
  q('Two conditions changed between the seedlings. What can you say about either one alone?',['Its separate effect cannot be identified.','It caused the whole difference.','It had no effect.'],0,'When two factors change together, their separate effects are mixed up.'),
  q('A survey asked only some people. Who does the result describe?',['Everyone.','Only the people who answered.','Most children.'],1,'Results describe the group asked. Extending them to everyone needs more evidence.'),
  q('No comparison group was measured. What does that limit?',['Recording what happened.','Claiming what caused the change.','Calculating a mean.'],1,'You can still record observations, but without a comparison you cannot isolate the cause.')
 ],
 fairtest:[
  q('In a fair test, how many conditions should you change on purpose?',['One.','Two.','As many as possible.'],0,'Change one variable and keep the others the same, so any difference can be linked to it.'),
  q('To test a wrap, which two set-ups should you compare?',['Any two cups.','Two that differ only in the wrap.','Two with different starting temperatures.'],1,'Every other condition must match, so only the wrap can explain the difference.'),
  q('How should you decide which seedlings get fertiliser?',['Give it to the tallest.','Assign comparable seedlings fairly, such as at random.','Let the pupil choose.'],1,'Fair assignment stops differences between the groups from being mistaken for an effect of fertiliser.'),
  q('The water amount changes along with temperature. What is the problem?',['Nothing.','Two variables change together.','The sugar is too fine.'],1,'If water amount also changes, you cannot tell which change affected dissolving. Keep water the same.')
 ],
 measurement:[
  q('An empty balance does not read zero. What should you do with that reading?',['Add it.','Subtract it from the sample reading.','Ignore it.'],1,'The offset is in every reading, so subtract it to find the true mass.'),
  q('The mean of several readings is…',['The largest reading.','Their total divided by how many there are.','The middle reading only.'],1,'Add the readings, then divide by the number of readings.'),
  q('One reading is very different from the others. What is the honest response?',['Delete it.','Keep it, investigate and repeat.','Use only that reading.'],1,'Keep the record. Investigate and repeat to see whether it was a mistake or a real effect.'),
  q('Readings agree closely but are all too high. What does that show?',['They are precise but not accurate.','They are accurate.','They are random.'],0,'Close agreement shows precision. A consistent offset from the true value shows a lack of accuracy.')
 ],
 graphs:[
  q('A graph line is horizontal over an interval. What does that show?',['The quantity stayed the same.','The quantity became zero.','The quantity rose quickly.'],0,'A flat line means no change in the plotted quantity over that time.'),
  q('The vertical axis does not start at zero. How do you find a real difference?',['Compare bar heights.','Subtract the labelled values.','Add the values.'],1,'A cut axis exaggerates differences. Read the scale values and subtract.'),
  q('Data stop at a certain day. What can you claim about later days?',['The pattern must continue.','Later behaviour needs more evidence.','It will reverse.'],1,'Claims beyond the measured range are predictions, not shown by the data.'),
  q('The intervals are equal in length. How do you compare average rates?',['Compare the change in each interval.','Compare the final values.','Compare the lowest values.'],0,'With equal times, the biggest change shows the fastest average rate.')
 ],
 normalise:[
  q('Two set-ups ran for different times. How do you compare them fairly?',['Compare totals.','Compare amount per minute.','Compare the longer one only.'],1,'Divide by time so each result is a rate on the same basis.'),
  q('The panels have different areas. How do you compare them fairly?',['Energy per square metre.','Total energy.','Panel size.'],0,'Dividing by area compares how well each square metre performs.'),
  q('The bubbles are different sizes. What does counting bubbles alone tell you?',['Total gas volume.','Not enough to compare gas volume.','Which plant is larger.'],1,'Bubble count ignores bubble size, so it cannot compare volumes.'),
  q('Cultures differ in mass and time. What fair comparison should you make?',['Output per gram per minute.','Total output.','Mass only.'],0,'Divide by both mass and time to compare on the same basis.')
 ],
 models:[
  q('Two models disagree about one condition. Which test separates them?',['A condition where they agree.','The condition where they predict differently.','Any condition.'],1,'Only a test where predictions differ can show which model fits better.'),
  q('Two things happen together. What does that alone show?',['An association.','That one causes the other.','Nothing.'],0,'Things can occur together without one causing the other.'),
  q('A rule needs condition A AND condition B. If only A is met, the rule predicts…',['It acts.','It does not act.','It acts halfway.'],1,'“And” means both must be true.'),
  q('Both models agree in one test. What would separate them?',['Repeat the same test.','Change the condition where they differ.','Nothing can.'],1,'Choose a test where one model predicts action and the other does not.')
 ],
 circuits:[
  q('Two bulbs are in one series loop. What happens if the loop is broken anywhere?',['Both bulbs go out.','Only the nearer bulb goes out.','Nothing changes.'],0,'There is only one path. A break stops current through every part of the loop.'),
  q('Bulbs are on separate parallel branches. One branch is opened. What happens to the other branch?',['It goes out too.','It still has a complete path.','It gets no current.'],1,'Each parallel branch is its own complete path back to the cell.'),
  q('What decides whether parts of a circuit are connected?',['How close they look in the drawing.','Whether a conducting path joins them.','Their colour.'],1,'Trace the wires. Connection depends on conducting paths, not on position in the picture.'),
  q('A break is made in one part of a parallel circuit. What should you check?',['Which branches still have a complete path.','Which bulb is nearest the cell.','Wire colour.'],0,'Trace each branch from the cell and back. A branch only works if its path is complete.')
 ],
 light:[
  q('How do we see an object that does not give out its own light?',['Light from the eye reaches it.','Light from a source reflects off it into the eye.','It glows faintly.'],1,'Light travels from the source, reflects off the object and enters the eye.'),
  q('An opaque card moves closer to a small light source. What happens to its shadow?',['It gets larger.','It gets smaller.','It stays the same.'],0,'Closer to the source, the card blocks a wider cone of light.'),
  q('Mirror angles are measured from…',['The mirror surface.','The normal, at right angles to the mirror.','The light source.'],1,'Angle of incidence and reflection are both measured from the normal, and they are equal.'),
  q('Which change affects shadow size in a point-source model?',['Moving the card or screen relative to the source.','Changing the card’s colour.','Changing the room temperature.'],0,'Shadow size depends on distances from the source to the card and to the screen.')
 ],
 heat:[
  q('Two objects at the same temperature feel different. Why might metal feel colder?',['It is colder.','Heat flows from your hand into it faster.','It has no heat.'],1,'Metal conducts heat away from your hand quickly, even at the same temperature.'),
  q('Which result supports that a wrap reduces cooling?',['The wrapped cup ends warmer than the bare cup.','The wrapped cup starts warmer.','Both end at room temperature.'],0,'With the same starting temperature, ending warmer shows less heat was lost.'),
  q('While ice melts, energy is supplied but the temperature stays steady. Where does the energy go?',['Into changing state.','Nowhere.','Into the thermometer.'],0,'During melting, energy changes the state rather than raising the temperature.'),
  q('The cups started at different temperatures. What does that mean for the comparison?',['It is fair.','It does not isolate the effect of the wrap.','It proves wrap B is better.'],1,'A fair comparison needs the same starting temperature.')
 ],
 forces:[
  q('A moving cart has equal forward and backward forces. What happens?',['It keeps moving at the same speed.','It stops.','It speeds up.'],0,'Balanced forces mean no change in motion. It does not stop by itself.'),
  q('Opposite forces act on a cart. How do you find the net force?',['Add them.','Subtract the smaller from the larger.','Use the larger only.'],1,'Opposite forces subtract. The larger force sets the direction.'),
  q('Two carts with equal starting speeds stop in different distances. What does a shorter stop suggest?',['A greater opposing force.','A smaller opposing force.','No force.'],0,'Stopping sooner means a stronger average opposing force.'),
  q('A spring stretches in proportion to force only within a range. What should you check?',['Whether the new force is inside that range.','The spring’s colour.','Nothing.'],0,'Proportional prediction is valid only inside the tested range.')
 ],
 energy:[
  q('In a battery lamp, energy starts as…',['Light.','Stored chemical energy.','Heat.'],1,'The battery stores chemical energy, which is transferred electrically to the lamp.'),
  q('A device receives energy and gives some useful output. What happens to the rest?',['It disappears.','It is transferred in other forms, often heat.','It returns to the source.'],1,'Energy is conserved. Input = useful output + other transfers.'),
  q('How do you compare total energy from two devices?',['Compare power only.','Multiply energy per second by time.','Compare time only.'],1,'Total energy = rate × time.'),
  q('Energy in = useful output + stored increase + ?',['Transfer to the surroundings.','Nothing.','Light only.'],0,'All the input must be accounted for. Whatever is not useful or stored goes to the surroundings.')
 ],
 magnets:[
  q('A magnet attracts a bar. What can you conclude?',['The bar is definitely a magnet.','The bar is a magnet or a magnetic material.','The bar is not metal.'],1,'Attraction happens with magnets and magnetic materials. Only repulsion proves a magnet.'),
  q('Which result proves the bar is a magnet?',['Attraction.','Repulsion.','No effect.'],1,'Only like poles repel, so repulsion means the bar has a pole.'),
  q('Turns and current both changed between coils. What can you say about turns alone?',['Their effect is not isolated.','They caused the difference.','They have no effect.'],0,'Two variables changed, so their effects cannot be separated.'),
  q('Why keep current, core and procedure fixed?',['So only the tested variable changes.','To save time.','It does not matter.'],0,'Fixed conditions make the comparison fair.')
 ],
 classification:[
  q('How reliable is classifying an animal from one feature?',['Very reliable.','Weak — several features are needed.','Always wrong.'],1,'Different groups can share a feature. Use several features together.'),
  q('Using a key, what should you do at each step?',['Choose the description that matches the organism.','Skip to the end.','Pick at random.'],0,'Follow one matching choice at a time until you reach a group.'),
  q('Something moves and grows. Is that enough to call it living?',['Yes.','No — one behaviour alone is not enough.','Only if it moves.'],1,'Non-living things can show one feature. Living things show several life processes.'),
  q('To identify an insect, which features matter most?',['Colour.','Body parts and leg count.','Size.'],1,'Insects have three body parts and six legs.')
 ],
 plants:[
  q('What do green plants use to make food in photosynthesis?',['Carbon dioxide and water, with light energy.','Oxygen and soil.','Sugar and air.'],0,'Light energy drives the change from carbon dioxide and water into food.'),
  q('Output stops increasing at high light. What might explain this?',['Another factor is limiting.','Light stops working.','The plant dies.'],0,'When one factor is no longer limiting, another may be.'),
  q('Seeds grow shoots in darkness. What does this show?',['Light is never needed.','Early growth can use stored food.','Seeds photosynthesise in darkness.'],1,'Seeds have stored food for early growth. Later growth needs light.'),
  q('Rate rises, then falls at the hottest temperature. What can you claim?',['Rate always rises with temperature.','The hottest tested rate was lower than a cooler one.','Temperature has no effect.'],1,'Describe what the data show, within the tested range.')
 ],
 respiration:[
  q('When does a green plant respire?',['Only in darkness.','In light and darkness.','Only in light.'],1,'Respiration happens all the time. Photosynthesis needs light.'),
  q('Photosynthesis releases oxygen while respiration uses it. Net exchange is…',['Release minus use.','Release plus use.','Release only.'],0,'Net = what is produced − what is consumed.'),
  q('The net oxygen change is zero. Does that mean no processes are happening?',['Yes.','No — opposite processes can balance.','Only respiration is happening.'],1,'Equal and opposite rates give zero net change while both continue.'),
  q('How do you find the photosynthesis rate from net release and dark respiration?',['Net release + respiration.','Net release − respiration.','Respiration only.'],0,'The net release is what is left after respiration, so add respiration back.')
 ],
 transport:[
  q('Coloured water appears in certain tubes. What does this support?',['Water travels through those tubes.','All cells carry water equally.','Colour makes water rise.'],0,'The dye marks the path the water took.'),
  q('Which result shows more water loss from leaves in moving air?',['The fan plant loses more mass.','Both lose the same mass.','The fan plant gains mass.'],0,'With soil covered, mass lost is mainly water from the leaves.'),
  q('After gas exchange in the lungs, blood leaving the lungs has…',['More oxygen and less carbon dioxide.','Less oxygen.','The same gases.'],0,'Oxygen enters the blood and carbon dioxide leaves it in the lungs.'),
  q('The leafy shoot collects much more water than the leafless stem. What is supported?',['Leaves are associated with more water loss here.','Stems lose no water.','Leaves create water.'],0,'Compare like with like and claim only the association shown.')
 ],
 digestion:[
  q('What is the difference between digestion and absorption?',['Digestion breaks food down; absorption takes it into the body.','They are the same.','Absorption breaks food down.'],0,'Digestion makes small pieces; absorption moves them into the blood.'),
  q('A starch test is negative with enzyme and positive with water only. What does this support?',['The enzyme broke down starch.','Water broke down starch.','Nothing.'],0,'The control shows starch would remain without the enzyme.'),
  q('A heated enzyme no longer works but an unheated one does. What does this suggest?',['Heating caused a lasting change.','The enzyme was never active.','Cooling activates enzymes.'],0,'The comparison isolates heating as the cause.'),
  q('No starting test or positive reference was used. What does that limit?',['Concluding that starch was broken down.','Recording the result.','Using an indicator.'],0,'Without checking starch was there at first, a negative result does not show breakdown.')
 ],
 ecology:[
  q('In a food chain, an arrow points…',['From the food to the eater.','From the eater to the food.','In either direction.'],0,'Arrows show energy moving from food to consumer.'),
  q('A predator decreases. What may happen to its prey?',['Prey may increase.','Prey must disappear.','Nothing.'],0,'Less predation can let the prey population grow.'),
  q('An insect lives in water as a larva and flies as an adult. What must protection cover?',['Both habitats.','The adult habitat only.','The larval habitat only.'],0,'Each life stage needs its own habitat to survive.'),
  q('What happens to energy along a food chain?',['It passes on, with some lost at each step.','It is recycled back into sunlight.','It increases.'],0,'Energy flows one way. Some is transferred to the surroundings at each step.')
 ],
 matter:[
  q('Water evaporates inside a sealed container. What happens to the total mass?',['It stays the same.','It decreases.','It increases.'],0,'Nothing leaves a sealed container, so mass is conserved.'),
  q('An open dish loses mass in dry air. What is consistent?',['Water left as vapour.','Water was destroyed.','The dish lost mass.'],0,'Water vapour can leave an open dish, taking mass with it.'),
  q('Air in a sealed syringe is compressed. What happens to the particles?',['They get closer; their number stays the same.','Some disappear.','They get smaller.'],0,'Compression reduces space between particles without changing how many there are.'),
  q('Ice melts in a sealed bag. Which stays the same?',['Mass.','Volume.','Shape.'],0,'Changing state does not change the amount of matter in a closed system.')
 ],
 changes:[
  q('Which method separates sand from salt water?',['Filtration.','Evaporation only.','Magnetism.'],0,'Sand is undissolved and stays on the filter; dissolved salt passes through.'),
  q('Fine sugar dissolves faster. Does that show more sugar can dissolve?',['Yes.','No — speed and final amount are different things.','Only if stirred.'],1,'How fast something dissolves is not the same as how much can dissolve.'),
  q('To collect water and leave salt behind, you should…',['Evaporate and condense the water.','Filter it.','Freeze it.'],0,'Water evaporates and can be condensed; salt stays behind.'),
  q('Sugar fully dissolves in a sealed vessel. What happens to the total mass?',['It stays the same.','It decreases.','It increases a lot.'],0,'Dissolving does not destroy matter.')
 ],
 density:[
  q('Density equals…',['Mass ÷ volume.','Mass × volume.','Volume ÷ mass.'],0,'Divide mass by volume.'),
  q('An object floats if its density is…',['Less than the liquid’s.','More than the liquid’s.','Exactly zero.'],0,'Less dense objects float; more dense objects sink.'),
  q('In the floating model, fraction submerged equals…',['Object density ÷ liquid density.','Liquid density ÷ object density.','Mass ÷ volume.'],0,'Use the model given in the question.'),
  q('For a hollow sealed object, which density matters for floating?',['Its average density.','The shell material’s density only.','The air’s density only.'],0,'Use total mass ÷ outer volume.')
 ],
 water:[
  q('Droplets form on the outside of a cold bottle. Where does the water come from?',['Vapour in the air.','Inside the bottle.','The glass.'],0,'Water vapour condenses when it touches the cold surface.'),
  q('Moving air causes more water loss. What does that show?',['Moving air increased evaporation here.','Moving air stops evaporation.','Nothing.'],0,'With matched conditions, the difference links to air movement.'),
  q('Visible mist is…',['Tiny liquid droplets.','Water vapour.','Steam gas.'],0,'Water vapour is invisible. Mist is liquid droplets.'),
  q('Concentration falls after clean water flows in. What does concentration alone tell you?',['That it decreased, not how much pollutant was removed.','That all pollutant is gone.','Nothing.'],0,'Dilution lowers concentration without removing the pollutant.')
 ],
 earth:[
  q('What causes day and night?',['Earth rotating.','Earth orbiting the Sun.','The Moon.'],0,'Rotation turns each place towards and away from the Sun.'),
  q('A hemisphere tilts towards the Sun. What season does it have?',['Summer.','Winter.','No change.'],0,'Tilting towards the Sun gives more direct sunlight and longer days.'),
  q('Why does the Moon show phases?',['We see different parts of its sunlit half.','Earth’s shadow covers it.','It changes shape.'],0,'Half the Moon is always lit. Our view of that half changes.'),
  q('During an eclipse, where does the light come from?',['The Sun.','The Moon.','Earth.'],0,'The Moon does not make light. Eclipses are about shadows from sunlight.')
 ],
 technology:[
  q('A filter removes visible mud. What can you claim?',['Less visible cloudiness.','The water is safe.','All germs are removed.'],0,'Only what was observed is supported; safety needs other tests.'),
  q('A solar panel only works in light. How can a lamp run after sunset?',['Store energy during the day.','Use a bigger panel.','Point it at the Moon.'],0,'Storage keeps energy for later.'),
  q('One trial shows a crop does well. What is the best next step?',['Repeat controlled trials.','Plant it everywhere.','Stop testing.'],0,'One result needs repeating before it can be trusted.'),
  q('Energy passes through two retention steps. How do you find what remains?',['Multiply by both fractions.','Add the fractions.','Use only the first fraction.'],0,'Each step keeps a fraction of what was there before it.')
 ],
 'sx-cells':[
  q('Which feature is the most reliable sign that a cell comes from a plant rather than an animal?',['Having a nucleus.','Having a cell wall.','Being very small.'],1,'Plant and animal cells both have a nucleus, membrane and cytoplasm. Only the plant cell has a wall; some plant cells have no chloroplasts.'),
  q('How do you work out the total magnification of a microscope?',['Add the eyepiece and objective numbers.','Multiply the eyepiece and objective numbers.','Use the objective number only.'],1,'Each lens magnifies the image again, so multiply: ×10 and ×40 give ×400. For image size, multiply the actual size by the magnification.'),
  q('A plant cell has no chloroplasts. What does that tell you?',['It must be an animal cell.','It may come from a part of the plant that gets no light.','It cannot be alive.'],1,'Root and bulb cells have walls but no chloroplasts. One missing feature is not enough; use several features together.'),
  q('You know the image size and the magnification. How do you find the real size?',['Image size × magnification.','Image size ÷ magnification.','Image size − magnification.'],1,'The image is the real size made bigger, so divide to undo the magnification.')
 ],
 'sx-machines':[
  q('What two things decide the turning effect (moment) of a force?',['The force and its distance from the pivot.','The force and the colour of the lever.','Only how hard you push.'],0,'Moment = force × perpendicular distance. The same push further from the pivot turns more.'),
  q('When is a beam balanced?',['When both sides hold the same mass.','When clockwise and anticlockwise moments are equal.','When the heavier load is further out.'],1,'Compare mass × distance on each side. A heavier load nearer the pivot can balance a lighter one further away.'),
  q('What does a single movable pulley do in the ideal model?',['Halves the effort but you pull twice as much rope.','Halves the effort and the rope pulled.','Only changes the direction of the pull.'],0,'Two rope sections share the load. Machines trade force for distance; a fixed pulley only changes direction.'),
  q('Two loads hang on the same side of a pivot. How do you find their total turning effect?',['Use only the heavier load.','Add mass × distance for each load.','Multiply the two masses together.'],1,'Each load has its own moment. Moments on the same side add up; then compare with the other side.')
 ],
 'sx-pressure':[
  q('The same force acts on a smaller area. What happens to the pressure?',['It gets smaller.','It gets larger.','It stays the same.'],1,'Pressure = force ÷ area. Dividing by a smaller area gives a larger pressure.'),
  q('A brick can stand on different faces. Which face gives the greatest pressure?',['The face with the largest area.','The face with the smallest area.','All faces give the same pressure.'],1,'The weight is the same on every face, so the smallest area gives the largest pressure.'),
  q('How does the pressure in a liquid change as you go deeper?',['It increases.','It decreases.','It stays the same.'],0,'More liquid lies above a deeper point, so it presses harder. Air pressure differences explain straws and suction cups.'),
  q('Why does a sealed bag swell when taken up a high mountain?',['The air outside presses less than the air inside.','The air inside becomes heavier.','The bag becomes thinner.'],0,'Air pressure falls with height. The trapped air keeps pushing out while less air pushes in.')
 ],
 'sx-waves':[
  q('What does sound need to travel from a bell to your ear?',['Light.','A medium such as air, water or a solid.','A vacuum.'],1,'Sound is a vibration passed on by particles. With no particles, as in a vacuum, the sound cannot travel.'),
  q('For an echo, how far does the sound travel compared with the distance to the wall?',['The same distance.','Twice the distance.','Half the distance.'],1,'The sound goes there and back, so distance to the wall = speed × time ÷ 2. Thunder from lightning is one way only.'),
  q('In a fair test of whether bob mass affects a pendulum, what must stay the same?',['The mass of the bob.','The length of the string.','The time measured.'],1,'Change only the mass; keep the length and starting angle the same, and measure the time for several swings.'),
  q('A pendulum makes 20 swings in 30 s. How do you find one period?',['30 × 20','30 ÷ 20','20 ÷ 30'],1,'Period = total time ÷ number of swings: 1.5 s. Timing many swings gives a more accurate period.')
 ],
 'sx-chem':[
  q('What decides whether a change is chemical?',['Whether bubbles appear.','Whether a new substance is made.','Whether the shape changes.'],1,'Bubbles or colour are clues, but boiling water also bubbles. A chemical change makes a new substance.'),
  q('What turns limewater milky?',['Oxygen.','Carbon dioxide.','Water vapour.'],1,'The limewater test identifies carbon dioxide, made when an acid reacts with a carbonate.'),
  q('In an experiment on rusting, what does iron need in order to rust?',['Water only.','Air only.','Both water and air.'],2,'Nails with only water or only air stay shiny. Change one condition at a time to find out what is needed.'),
  q('A flask loses mass when vinegar and baking soda react in it. Where did the mass go?',['It was destroyed.','A gas escaped into the air.','The liquid became lighter by itself.'],1,'In an open flask, the new gas leaves. In a sealed flask the total mass would stay the same.')
 ],
 'sx-life':[
  q('Which life cycle has a pupa stage?',['Egg → nymph → adult.','Egg → larva → pupa → adult.','Both of them.'],1,'Four-stage life cycles have a larva and a pupa. In three-stage cycles the nymph looks like a small adult.'),
  q('How do you find the total time from egg to adult from a table?',['Use only the longest stage.','Add the times of the egg, larva and pupa stages.','Multiply the stages together.'],1,'Each stage follows the one before, so the times add up until the adult appears.'),
  q('Why does it help a plant when its seeds are carried far away?',['The seeds become bigger.','The young plants compete less with the parent for light, water and space.','The parent plant grows faster.'],1,'Link each fruit feature (hairs, hooks, husk, juicy flesh) to how it travels, then state the benefit: less competition.'),
  q('Where does a baby develop after fertilisation?',['In the womb (uterus).','In the stomach.','In the ovary.'],0,'A sperm joins an egg in fertilisation; the fertilised egg develops in the womb and inherits features from both parents.')
 ]
};
function check(subject,unit,form){
 const set=subject==='science'?science:maths;let list=set[unit];
 // Challenge modules (dsa-<name>.js) carry their own Quick checks.
 if(!list&&subject!=='science')for(const name of ['puzzles','numbers']){const M=root['MochiDSA_'+name];if(M?.quickChecks?.[unit]){list=M.quickChecks[unit];break;}}
 if(!list||!Number.isInteger(form)||form<0||form>=list.length)return null;
 return list[form];
}
const api={check,maths,science};
root.MochiQuickChecks=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
