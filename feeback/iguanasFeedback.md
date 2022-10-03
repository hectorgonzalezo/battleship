Reviewer: Hector Gonzalez

Project creator: Iguanas Everywhere

Project title: Battleship


## Design ##

Praises:

- Sound effects are awesome!

- The color palette has a nice contrast, and the font really add to the game's atmosphere.

- Nice effect in the title.

Critiques:

- After placing all the ships, the padding in #top-area gets reduced, and the remaining buttons get pushed against the boards.

- On small screens or window sizes the boards get squashed together, how about using a media query?

- I would probably rethink the sunken ship design with yellow background and asterisks. Maybe save the deep red of hits for sunken ships.

- Maybe make the enemy squares a different color than yours? This will help highlight the difference between  knowing what's in your board while ignoring the enemy's.

Additional comments:

The only critical details is the view when resizing the window, the rest are minor details that would help you game look even more awesome.

## Code ##

Praises:

- The AI is quite clever! The fact that it keeps on shooting in the same direction is a great accomplishment.

- Tests are very thorough, you really went for 100% coverage on game objects.

Critiques:

- Some of the tests may be redundant, such as all the "x hitcount is 1  after 1 hit". I would probably be enough to test the factory function instead of testing every object created.

- How about organizing the files in src/ into subdirectories? It would make your project more transparent.

- I would probably use switch statements instead of the many nested if statements in controlGame, it would make your intentions more apparent.

- The style of controlGame is quite declarative, how about giving OOP a chance and abstracting some of the functionality to methods or other objects? A really clear example is the two "playerInstructions" calls, that could probably be managed by a  method.


## Overall ##

Summary of review (a few sentences about your overall impression):

Very impressive UI, use of code tests and AI. At this point my main issue is the way code is organized, which is fine for the project and hand but might not be easily scalable.
