package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import com.google.inject.Guice
import de.htwg.se.uno.Kek
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
    Ok(views.html.displayGameSplit.prestart("testii"))
  }

  def create_game(name1: String, name2: String) = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)
    Ok(views.html.displayGame(controller.toString,""))
  }

  def next() = Action { implicit request: Request[AnyContent] => 
    controller.next()  
    Ok(views.html.displayGame(controller.toString,""))
  }

  def place(ind: Int) = Action { implicit request: Request[AnyContent] => 
    controller.place(ind)
    var erro = ""
    if(controller.game.ERROR < 0) {
        erro = "Can't place this card, try another one or take a card"
        controller.game.setError(0)
    }  
    Ok(views.html.displayGame(controller.toString, erro))
  }

  def take() = Action { implicit request: Request[AnyContent] => 
    controller.take()
    var erro = ""
    if(controller.game.ERROR < 0) {
        erro = "Can't take card in this state of the Game"
        controller.game.setError(0)
    }
    Ok(views.html.displayGame(controller.toString, erro))
  }

  def undo() = Action { implicit request: Request[AnyContent] => 
    controller.undo()  
    Ok(views.html.displayGame(controller.toString,""))
  }

  def redo() = Action { implicit request: Request[AnyContent] => 
    controller.redo()  
    Ok(views.html.displayGame(controller.toString,""))
  }

  def notFound() = Action { implicit request: Request[AnyContent] => 
    NotFound(views.html.notFound())
  }
  
  def badRequest(errorMessage: String) = Action {
    BadRequest(errorMessage + "\n")
  }


}
