package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import com.google.inject.Guice
import de.htwg.se.uno.Kek
import de.htwg.se.uno.aview.GUIP.displayCards
import de.htwg.se.uno.model.gameComponent.gameBaseImpl.Player
/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  val controller = new Kek().controller_return
  def home() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.home())
  }
    
  def setup() = Action { implicit request: Request[AnyContent] => 
  
    Ok(views.html.displayGame.prestartState())
  }

  def create_game(name1: String, name2: String) = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)
    create_tuple()
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.toString,""))
    } else {
      Ok(views.html.displayGame.playState(controller.toString,""))
    }  
  }

  def next() = Action { implicit request: Request[AnyContent] => 
    controller.next()
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.toString,""))
    } else {
      Ok(views.html.displayGame.playState(controller.toString,""))
    }  
    }

  def place(ind: Int) = Action { implicit request: Request[AnyContent] => 
    controller.place(ind)
    var erro = ""
    if(controller.game.ERROR < 0) {
        erro = "Can not place this card, try another one or take a card"
        controller.game.setError(0)
    }
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.toString, erro))
    } else {
      Ok(views.html.displayGame.playState(controller.toString, erro))
    }  
  }

  def take() = Action { implicit request: Request[AnyContent] => 
    controller.take()
    var erro = ""
    if(controller.game.ERROR < 0) {
        erro = "Can not take card in this state of the Game"
        controller.game.setError(0)
    }
    Ok(views.html.displayGame.playState(controller.toString, erro))
  }

  def undo() = Action { implicit request: Request[AnyContent] => 
    controller.undo()  
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.toString,""))
    } else {
      Ok(views.html.displayGame.playState(controller.toString,""))
    }  
  }

  def redo() = Action { implicit request: Request[AnyContent] => 
    controller.redo()  
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.toString,""))
    } else {
      Ok(views.html.displayGame.playState(controller.toString,""))
    }   
  }

  def notFound() = Action { implicit request: Request[AnyContent] => 
    NotFound(views.html.notFound())
  }
  
  def badRequest(errorMessage: String) = Action {
    BadRequest(errorMessage + "\n")
  }

  def create_tuple() = {
    var card_list = List()
    for(p <- controller.game.pList){
      card_list :+ (create_per_player(p))
    }
    card_list :+ create_per_player(controller.game.midCard)
  }

  def create_per_player(player: Player) = {
    var cards = List()
    for(c <- player.karten){
    var color = ""
    var value = ""
    c.getColor = any match {
      case CardColor.Red    => color = "red"
      case CardColor.Blue   => color = "blue"
      case CardColor.Green  => color = "green"
      case CardColor.Yellow => color = "yellow"
      case CardColor.Black  => color = "black"
      case CardColor.ErrorC => color = ""
    }

    c.getValue = any match {
      case CardValue.Zero     => value = "_0"
      case CardValue.One      => value = "_1"
      case CardValue.Two      => value = "_2"
      case CardValue.Three    => value = "_3"
      case CardValue.Four     => value = "_4"
      case CardValue.Five     => value = "_5"
      case CardValue.Six      => value = "_6"
      case CardValue.Seven    => value = "_7"
      case CardValue.Eight    => value = "_8"
      case CardValue.Nine     => value = "_9"
      case CardValue.Take2    => value = "_+2"
      case CardValue.Skip     => value = "_skip"
      case CardValue.Wildcard => value = "_wildcard"
      case CardValue.Take4    => value = "_+4"
      case CardValue.Special  => value = ""
      case CardValue.Error    => value = ""
    }
    cards :+ "cards/" + color + value + ".png"
    }
    print(cards)
  }
}
