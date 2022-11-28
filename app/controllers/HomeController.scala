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

  val controller: controllerInterface = new Kek().controller_return

  def home(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.home())
  }

  def about(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.about())
  }

  def setup(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.displayGame.prestartState())
  }

  def createGame(name1: String, name2: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)
      Ok(views.html.displayGame.playState(get_right_tuple(),"", controller.create_tuple()(0).length, controller.create_tuple()(2).length, controller.game.pList(0).name, controller.game.pList(1).name, get_card_count_of_next_player()))
  }

  def placeCard(ind: Int): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(ind)
    Ok(controller.return_j)
  }

  def retJson(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val json = controller.return_j
    Ok(json)
  }

  def nextPlayer(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.next()
    Ok(controller.return_j)
  }

  def takeCard(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.take()
    Ok(controller.return_j)
  }


  def notFound(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(views.html.notFound())
  }
  
  def badRequest(errorMessage: String): Action[AnyContent] = Action {
    BadRequest(errorMessage + "\n")
  }

  def get_right_tuple(): List[List[(String, Int)]] = {
    var correct_player_tuple = List[List[(String, Int)]]()
    val tmp_tuple = controller.create_tuple()
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      correct_player_tuple = List(tmp_tuple(1))
    } else {
      if(controller.game.currentstate.toString() == "player1State"){
        correct_player_tuple = List(tmp_tuple(1), tmp_tuple(0))
      } else {
        correct_player_tuple = List(tmp_tuple(1), tmp_tuple(2))
      }
    }   
    return correct_player_tuple
    }

  def get_name_of_next_player(): String = {
    var name = ""
      if(controller.game.currentstate.toString() == "between12State"){
          name = controller.game.pList(1).name
      } 
      else if(controller.game.currentstate.toString() == "between21State"){
          name = controller.game.pList(0).name
      }
      return name
    }

    def get_card_count_of_next_player(): Int = {
    var anz = 0
      if(controller.game.currentstate.toString() == "player1State"){
          anz = controller.game.pList(0).karten.length
      } 
      else if(controller.game.currentstate.toString() == "player2State"){
          anz = controller.game.pList(1).karten.length
      }
      return anz
    }

    //def return_json(): String = {
    //  controller.return_j()
    //}
}
