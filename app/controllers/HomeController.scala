package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import com.google.inject.Guice
import de.htwg.se.uno.Kek
import de.htwg.se.uno.aview.GUIP.displayCards
import de.htwg.se.uno.model.gameComponent.gameBaseImpl.Player
import scala.collection.mutable.ListBuffer

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
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.create_tuple(),""))
    } else {
      Ok(views.html.displayGame.playState(controller.create_tuple(),""))
    }  
  }

  def next() = Action { implicit request: Request[AnyContent] => 
    controller.next()
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.create_tuple(),""))
    } else {
      Ok(views.html.displayGame.playState(controller.create_tuple(),""))
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
      Ok(views.html.displayGame.betweenState(controller.create_tuple(), erro))
    } else {
      Ok(views.html.displayGame.playState(controller.create_tuple(), erro))
    }  
  }

  def take() = Action { implicit request: Request[AnyContent] => 
    controller.take()
    var erro = ""
    if(controller.game.ERROR < 0) {
        erro = "Can not take card in this state of the Game"
        controller.game.setError(0)
    }
    Ok(views.html.displayGame.playState(controller.create_tuple(), erro))
  }

  def undo() = Action { implicit request: Request[AnyContent] => 
    controller.undo()  
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.create_tuple(),""))
    } else {
      Ok(views.html.displayGame.playState(controller.create_tuple(),""))
    }  
  }

  def redo() = Action { implicit request: Request[AnyContent] => 
    controller.redo()  
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(controller.create_tuple(),""))
    } else {
      Ok(views.html.displayGame.playState(controller.create_tuple(),""))
    }   
  }

  def notFound() = Action { implicit request: Request[AnyContent] => 
    NotFound(views.html.notFound())
  }
  
  def badRequest(errorMessage: String) = Action {
    BadRequest(errorMessage + "\n")
  }


}
