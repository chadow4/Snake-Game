// SNAKE PROJET JAVASCRIPT Marie BENEDUCI & Julien SANCHEZ

/* 
		Définition des différentes variables
*/

var score=document.getElementById("score"); // Récupération de la div score
var dessin=document.getElementById("dessin"); // Récupération de la div "canva"
var ctx=dessin.getContext("2d"); // Afin de dessiner sur le canva nous devons passer par un contexte ici "2d"
var niveau1= document.getElementById("1"); // Récupération des boutons"
var niveau2 = document.getElementById("2");
var niveau3 = document.getElementById("3");
var currentlvl = document.getElementById("currentlvl"); // Récupérattion du niveau en cour



dessin.style.display ="none";
score.style.display ="none";

var lvl1 = document.createElement("audio");
lvl1.src = "songs/lvl1.mp3";


var lvl2 = document.createElement("audio");
lvl2.src = "songs/lvl2.mp3";

var lvl3 = document.createElement("audio");
lvl3.src = "songs/lvl3.mp3";

var deathsound = document.createElement("audio");
deathsound.src = "songs/gameover.mp3";

var foodImg = new Image()
foodImg.src  = 'img/food.png';

var headsnake = new Image()
headsnake.src  = 'img/headsnake.png';


var bodySnake = new Image()
bodySnake.src  = 'img/bodysnake.png';

var wall = new Image()
wall.src  = 'img/wall.png';




 
function playSnake(niveauNumber){
	
	$.get("niveau"+niveauNumber+".json", function(data){
		
		var NB_COLONNES = data["dimensions"][1];
		var NB_LIGNES = data["dimensions"][0];
		var COTE=20; // dimensions en pixels des carrés qui servent de trame pour le jeu

	
		/* 
			Lorsque le bouton play va etre actionné le jeu va pouvoir commencer et on affiche le dessin et le score
		*/

		dessin.style.display ="block";
		score.style.display ="block";
		niveau1.style.display = "none";
		niveau2.style.display = "none";
		niveau3.style.display = "none";
		currentlvl.innerHTML= "Niveau actuel : niveau " + niveauNumber;



		/* 
			Dimensionnement du "canva" en pixel 
		*/

		dessin.width=NB_COLONNES*COTE;
		dessin.height=NB_LIGNES*COTE;

		
	 


		/* 
			Initialisation du serpent
		*/
		let snake = [] ;

		for (i=0;i<data["snake"].length;i++){
			snake[i]=data["snake"][i];
		}

		var longueurDecrementableInitiale = snake.length-1; // on récupère la longueur decrémentable du serpent initial afin de la retirer pour le calcul du score initial
		

		/* 
			Initialisation des murs
		*/

		let mur = [] ;

		for (i=0;i<data["walls"].length;i++){
			mur[i]=data["walls"][i];
		}
		
		
		
		/* 
			Position de la pomme avant le démarrage du jeu 
		*/
		var apple=0;
		


		/*
			Variable de déplacement du serpent (initialisé en x=1 afin de déclencher le déplacement )
		*/
		var snakeDirectionX=1;  // le snake va commencer par partir par la droite si X = 1 
		var snakeDirectionY=0; // le snake va commencer par partir par le bas si Y = 1


		/* 

		Fonction de mise à jour du dessin
		Cette fonction va s'occuper de dessiner sur le canva le dessin correspondant à l'état actuel du jeu :

		*/

		function majDessin(){
			ctx.clearRect(0,0,dessin.width,dessin.height); // on efface l'ensemble du canva
			ctx.drawImage(headsnake,snake[0][0]*COTE,snake[0][1]*COTE,COTE,COTE); // graphisme de la tete du serpent
			
			for(var i=1,l=snake.length;i<l;i++){
				ctx.drawImage(bodySnake,snake[i][0]*COTE,snake[i][1]*COTE,COTE,COTE);  // graphisme du reste de son corps
			}
			ctx.drawImage(foodImg,apple[0]*COTE,apple[1]*COTE,COTE,COTE);

			for(var i=0; i<mur.length;i++){
				// ctx.fillRect(mur[i][0]*COTE,mur[i][1]*COTE,COTE,COTE) 
				ctx.drawImage(wall,mur[i][0]*COTE,mur[i][1]*COTE,COTE,COTE);
			}
			
		}
		/*  
			Fonction de mise à jour du score
		*/

		function majScore(s){
			score.innerHTML="Score : " + s;
		}

		/*
			Fonction de gestion de fin de partie
		*/
		function finPartie(){
			clearInterval(timerJeu); // le timer qui apelle la fonction à fréquence = delay est arrété
			lvl1.pause();
			lvl2.pause();
			lvl3.pause();
			deathsound.play();
			alert("Perdu !"); // affichage du message de fin
			location.reload(); // on relance la page en cas de fin de partie
		}
		/*
		Fonction de la boucle du jeu
		*/

		function boucleJeu(){
			if(bougeSnake()){ // si le serpent bouge alors le jeu continue grace au dessin
				majDessin();
			}else{
				finPartie(); // sinn la partie se stop
			}
		}

		/* 
			Fonction de déplacement avec les fleches du clavier 
			Les variables snakeDirectionX et snakeDirectionY vont être modifié suivant la touche appuyé.
		*/

		document.addEventListener('keydown', (e)=>{
			switch(e.keyCode){
				case 37: //Gauche
					if(snakeDirectionX==0){
						snakeDirectionX=-1;
						snakeDirectionY=0
					}
				break;	
				case 38: //Haut
					if(snakeDirectionY==0){
						snakeDirectionX=0;
						snakeDirectionY=-1
					}
				break;	
				case 39: //Droite
					if(snakeDirectionX==0){
						snakeDirectionX=1;
						snakeDirectionY=0
					}
				break;
				case 40: //Bas
					if(snakeDirectionY==0){
						snakeDirectionX=0;
						snakeDirectionY=1;
					}
				break;
			}
		})

		/* Fonction qui place la pomme initiale au coordonnées définis puis les suivant au hasard */

		function placeapple(){
			
			if (apple == 0){
				apple = [data["food"][0][0],data["food"][0][1]];
			}
			else{
				apple=[1+Math.floor((NB_COLONNES-2)*Math.random()),1+Math.floor((NB_LIGNES-2)*Math.random())];
				
				for(var i=0,l=mur.length-1;i<l;i++){  // gestion d'erreur en cas da pomme qui spawn sur un mur 
					if((apple[0]==mur[i][0]) && (apple[1]==mur[i][1])){
						placeapple();
					}
				}

				for(var i=0,l=snake.length-1;i<l;i++){  // gestion d'erreur en cas de pomme qui spawn sur sur le snake 
					if((apple[0]==snake[i][0]) && (apple[1]==snake[i][1])){
						placeapple();
					}
				}
			}
			
		}

		

		/*
			
			Fonction de la gestion de la position du serpent

		*/

		function bougeSnake(){
			var tete=[snake[0][0]+snakeDirectionX,snake[0][1]+snakeDirectionY];  // calcul de la position de la nouvelle tete

			if(tete[0]==-1||tete[0]==NB_COLONNES||tete[1]==-1||tete[1]==NB_LIGNES) return false; // verification si le serpent touche un bord

			for(var i=0,l=snake.length-1;i<l;i++){ // à l'aide de la boucle nous allons verifier si le serpent s'est mordu
				if((tete[0]==snake[i][0])&&(tete[1]==snake[i][1])) return false;
			}

			for(var i=0,l=mur.length-1;i<l;i++){ // à l'aide de la boucle nous allons verifier si le seerpent a touché un mur central
				if((tete[0]==mur[i][0])&&(tete[1]==mur[i][1])) return false;
			}

			if((tete[0]==apple[0])&&(tete[1]==apple[1])){ // si la position de la tete = pomme alors ce dernier est mangé 
				placeapple(); // on place une nouvelle pomme
				majScore(snake.length-longueurDecrementableInitiale); // on met à jour le score en pensant bien à enlever du score la taille initiale du serpent (déclaré plus haut)
			}else{
				snake.pop(); // sinon le serpent ne s'allonge pas 
			}

			snake.unshift(tete); // la nouvelle position de tête est ajouté au début du tableau snake
			return true;
		}

		/* Initialisation du jeu

			Une premiere pomme est placé et un un timer est utilisé pour appeler la fonction {{{boucleJeu}}} avec l'intervalle défini par la variable delay 

		*/

		placeapple();
		var timerJeu=setInterval(boucleJeu,data["delay"]);
		
		if(niveauNumber==1){
			lvl1.play();
			lvl1.volume = 0.25;
			lvl1.loop=true;
		}
		if(niveauNumber==2){
			lvl2.play();
			lvl2.volume = 0.25;
			lvl2.loop=true;
		}
		 
		if(niveauNumber==3){
			lvl3.play();
			lvl3.volume = 0.25;
			lvl3.loop=true;
		}

	});


}
