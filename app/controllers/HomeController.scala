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
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index())
  }
  def create_game(name1: String, name2: String) = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)
    Ok(views.html.displayGame(controller.toString))
  }
}
